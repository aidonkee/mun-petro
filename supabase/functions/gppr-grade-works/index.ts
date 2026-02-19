import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function gradeOneWork(
  workId: string,
  filePath: string,
  fileType: string,
  studentName: string,
  criteriaText: string,
  supabase: ReturnType<typeof createClient>,
  SUPABASE_URL: string,
  SUPABASE_SERVICE_ROLE_KEY: string,
  LOVABLE_API_KEY: string
) {
  // Mark as grading
  await supabase.from("gppr_student_works").update({ status: "grading" }).eq("id", workId);

  try {
    // Download student work
    const fileResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/gppr-works/${filePath}`, {
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });

    if (!fileResponse.ok) throw new Error(`Failed to download work file: ${fileResponse.status}`);

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    const mimeType = fileType || "application/pdf";

    const criteriaObj = JSON.parse(criteriaText);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert Cambridge Global Perspectives (GPPR) examiner.
You will be given assessment criteria and a student's work. Grade the work against each criterion.

ASSESSMENT CRITERIA:
${JSON.stringify(criteriaObj, null, 2)}

Return a JSON object with this exact structure:
{
  "student_name": "${studentName}",
  "criteria_scores": [
    {
      "criterion": "criterion name",
      "awarded_marks": number,
      "max_marks": number,
      "level_achieved": "level label",
      "justification": "2-3 sentence justification with evidence from work"
    }
  ],
  "total_score": number,
  "total_possible": number,
  "grade_letter": "A/B/C/D/E",
  "overall_feedback": "Comprehensive 3-4 paragraph feedback including strengths, areas for improvement, and specific recommendations",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}

Be thorough, constructive, and base all scores strictly on the provided criteria descriptors.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please grade this student work by ${studentName}:`,
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      if (aiResponse.status === 429) throw new Error("AI rate limit exceeded");
      if (aiResponse.status === 402) throw new Error("AI credits exhausted");
      throw new Error(`AI failed: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    await supabase.from("gppr_student_works").update({
      ai_score: `${result.total_score}/${result.total_possible} (${result.grade_letter})`,
      ai_feedback: result.overall_feedback,
      ai_criteria_scores: result,
      status: "graded",
    }).eq("id", workId);

    return { workId, success: true };
  } catch (err) {
    await supabase.from("gppr_student_works").update({
      status: "error",
      ai_feedback: err instanceof Error ? err.message : "Grading failed",
    }).eq("id", workId);
    return { workId, success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const { sessionId, workIds } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get session criteria
    const { data: session, error: sessionError } = await supabase
      .from("gppr_sessions")
      .select("criteria_text")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) throw new Error("Session not found");
    if (!session.criteria_text) throw new Error("Criteria not yet analyzed for this session");

    // Get works to grade
    const query = supabase
      .from("gppr_student_works")
      .select("id, file_path, file_type, student_name")
      .eq("session_id", sessionId)
      .eq("status", "pending");

    if (workIds && workIds.length > 0) {
      query.in("id", workIds);
    }

    const { data: works, error: worksError } = await query;
    if (worksError) throw worksError;
    if (!works || works.length === 0) throw new Error("No pending works found to grade");

    // Grade works sequentially to avoid rate limits
    const results = [];
    for (const work of works) {
      const result = await gradeOneWork(
        work.id,
        work.file_path,
        work.file_type || "application/pdf",
        work.student_name,
        session.criteria_text,
        supabase,
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        LOVABLE_API_KEY
      );
      results.push(result);
      // Small delay between requests
      await new Promise((r) => setTimeout(r, 500));
    }

    return new Response(JSON.stringify({ success: true, results, total: works.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gppr-grade-works error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

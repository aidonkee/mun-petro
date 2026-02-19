import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const { sessionId, filePath, fileType } = await req.json();
    if (!sessionId || !filePath) throw new Error("sessionId and filePath are required");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Download criteria file
    const fileResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/gppr-criteria/${filePath}`, {
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });

    if (!fileResponse.ok) throw new Error(`Failed to download criteria file: ${fileResponse.status}`);

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    const mimeType = fileType || "application/pdf";

    // Send to Gemini for analysis
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
            content: `You are an expert in Cambridge Global Perspectives (GPPR) assessment. 
Analyze the provided assessment criteria/rubric document and extract all grading criteria with their levels and descriptors.
Return a JSON object with:
{
  "criteria": [
    {
      "name": "criterion name",
      "max_marks": number,
      "levels": [
        {"level": "0", "descriptor": "..."},
        {"level": "1-3", "descriptor": "..."}
      ]
    }
  ],
  "summary": "brief summary of the assessment",
  "total_marks": number,
  "assessment_type": "Unit/Term/etc"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this assessment criteria document and extract all grading rubric information:",
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
      if (aiResponse.status === 429) throw new Error("AI rate limit exceeded, please try again later");
      if (aiResponse.status === 402) throw new Error("AI credits exhausted, please top up your workspace");
      throw new Error(`AI request failed: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const criteriaJson = JSON.parse(aiData.choices[0].message.content);
    const summary = criteriaJson.summary || "Assessment criteria loaded";
    const criteriaText = JSON.stringify(criteriaJson, null, 2);

    // Save to session
    const { error } = await supabase
      .from("gppr_sessions")
      .update({
        criteria_text: criteriaText,
        criteria_summary: summary,
        status: "criteria_ready",
      })
      .eq("id", sessionId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, criteria: criteriaJson, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gppr-analyze-criteria error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

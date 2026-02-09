import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateEmail(name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
  const randomNum = Math.floor(Math.random() * 10000);
  return `${cleanName}${randomNum}@delegate.mun`;
}

interface StudentInput {
  name: string;
  country: string;
  committee?: string;
}

interface CreatedStudent {
  success: boolean;
  name: string;
  country: string;
  committee: string;
  email?: string;
  password?: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .single();

    if (roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can create students" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { students } = await req.json() as { students: StudentInput[] };

    if (!students || !Array.isArray(students) || students.length === 0) {
      return new Response(
        JSON.stringify({ error: "Students array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (students.length > 100) {
      return new Response(
        JSON.stringify({ error: "Maximum 100 students per import" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: CreatedStudent[] = [];

    for (const student of students) {
      const { name, country, committee = "General Assembly" } = student;

      if (!name || !country) {
        results.push({
          success: false,
          name: name || "Unknown",
          country: country || "Unknown",
          committee,
          error: "Name and country are required",
        });
        continue;
      }

      try {
        const email = generateEmail(name);
        const password = generatePassword(10);

        // Create the user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (createError || !newUser.user) {
          console.error("Error creating user:", createError);
          results.push({
            success: false,
            name,
            country,
            committee,
            error: createError?.message || "Failed to create user",
          });
          continue;
        }

        // Assign delegate role
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: newUser.user.id,
            role: "delegate",
          });

        if (roleError) {
          console.error("Error assigning role:", roleError);
        }

        // Create delegate profile with credentials
        const { error: profileError } = await supabaseAdmin
          .from("delegate_profiles")
          .insert({
            user_id: newUser.user.id,
            delegate_name: name,
            country,
            committee,
            login_email: email,
            login_password: password,
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        results.push({
          success: true,
          name,
          country,
          committee,
          email,
          password,
        });
      } catch (error) {
        console.error("Unexpected error for student:", name, error);
        results.push({
          success: false,
          name,
          country,
          committee: committee || "General Assembly",
          error: "Unexpected error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        total: students.length,
        created: successCount,
        failed: failedCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

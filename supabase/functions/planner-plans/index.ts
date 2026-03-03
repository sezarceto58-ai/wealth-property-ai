import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const url = new URL(req.url);
    const planId = url.searchParams.get("id");

    if (req.method === "GET") {
      if (planId) {
        const { data, error } = await supabase
          .from("project_plans")
          .select("*")
          .eq("id", planId)
          .single();
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const { data, error } = await supabase
          .from("project_plans")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (req.method === "PUT" && planId) {
      const updates = await req.json();
      // Only allow updating specific fields (pricing overrides, etc.)
      const allowedFields: Record<string, any> = {};
      if (updates.result) {
        // Merge result partially
        const { data: existing } = await supabase
          .from("project_plans")
          .select("result")
          .eq("id", planId)
          .single();
        allowedFields.result = { ...(existing?.result || {}), ...updates.result };
      }
      if (updates.status) allowedFields.status = updates.status;

      const { data, error } = await supabase
        .from("project_plans")
        .update(allowedFields)
        .eq("id", planId)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE" && planId) {
      const { error } = await supabase.from("project_plans").delete().eq("id", planId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("planner-plans error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type AuthedContext = {
  token: string;
  userId: string;
  userEmail?: string;
};

export async function requireUser(req: Request): Promise<AuthedContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("No authorization header provided");

  const token = authHeader.replace("Bearer ", "");

  const anon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const { data, error } = await anon.auth.getUser(token);
  if (error) throw new Error(`Authentication error: ${error.message}`);
  if (!data.user) throw new Error("User not authenticated");

  return { token, userId: data.user.id, userEmail: data.user.email ?? undefined };
}

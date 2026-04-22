import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env/server";
import type { Database } from "./database.types";

export function createServiceRoleSupabaseClient() {
  const serverEnv = getServerEnv();
  return createClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY
  );
}

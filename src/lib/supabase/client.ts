import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
	const config = getSupabaseConfig();

	if (!config) {
		return null;
	}

	if (!supabaseClient) {
		supabaseClient = createClient(config.url, config.anonKey, {
			auth: {
				autoRefreshToken: true,
				detectSessionInUrl: true,
				persistSession: true,
			},
		});
	}

	return supabaseClient;
}

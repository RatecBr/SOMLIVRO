const STORAGE_KEY = "audiobooks_supabase_config_v1";

export type SupabaseConfig = {
	url: string;
	anonKey: string;
};

export function getSupabaseConfig(): SupabaseConfig | null {
	const urlFromEnv = import.meta.env.VITE_SUPABASE_URL as string | undefined;
	const keyFromEnv = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

	if (urlFromEnv && keyFromEnv) {
		const url = urlFromEnv.trim();
		const anonKey = keyFromEnv.trim();
		if (url && anonKey) {
			return { url, anonKey };
		}
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<SupabaseConfig>;
		if (!parsed.url || !parsed.anonKey) return null;
		const url = parsed.url.trim();
		const anonKey = parsed.anonKey.trim();
		if (!url || !anonKey) return null;
		return { url, anonKey };
	} catch {
		return null;
	}
}

export function setSupabaseConfig(config: SupabaseConfig) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearSupabaseConfig() {
	localStorage.removeItem(STORAGE_KEY);
}

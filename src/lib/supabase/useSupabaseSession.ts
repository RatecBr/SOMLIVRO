import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "./client";

export function useSupabaseSession() {
	const [session, setSession] = useState<Session | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [configError, setConfigError] = useState<string | null>(null);

	useEffect(() => {
		const supabase = getSupabaseClient();
		if (!supabase) {
			setConfigError(
				"Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
			);
			setIsReady(true);
			return;
		}

		supabase.auth
			.getSession()
			.then(({ data, error }) => {
				if (error) {
					setConfigError(error.message);
					setSession(null);
				} else {
					setSession(data.session);
				}
				setIsReady(true);
			})
			.catch((err: unknown) => {
				setConfigError(err instanceof Error ? err.message : String(err));
				setSession(null);
				setIsReady(true);
			});

		const { data: subscription } = supabase.auth.onAuthStateChange(
			(_event, newSession) => {
				setSession(newSession);
			},
		);

		return () => {
			subscription.subscription.unsubscribe();
		};
	}, []);

	return { session, isReady, configError };
}

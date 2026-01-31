import { config as dotenvConfig } from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" });

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
	process.stderr.write(
		"Supabase env ausente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local\n",
	);
	process.exit(1);
}

const supabase = createClient(url, anonKey, {
	auth: {
		autoRefreshToken: false,
		detectSessionInUrl: false,
		persistSession: false,
	},
});

const { error } = await supabase
	.from("audiobooks")
	.select("id", { count: "exact", head: true });

if (error) {
	process.stderr.write(`Falha ao acessar tabela audiobooks: ${error.message}\n`);
	process.exit(1);
}

process.stdout.write("OK: Supabase conectado e tabela audiobooks acessível.\n");

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { setSupabaseConfig } from "@/lib/supabase/config";

interface AdminLoginProps {
	onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [supabaseUrl, setSupabaseUrl] = useState("");
	const [supabaseKey, setSupabaseKey] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!email || !password) {
			setError("Por favor, informe email e senha");
			return;
		}

		const supabase = getSupabaseClient();
		if (!supabase) {
			setError("Supabase não configurado. Informe a URL e a chave do Supabase abaixo.");
			return;
		}

		setIsPending(true);
		(async () => {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) {
				throw error;
			}
			if (data.session) {
				onLogin();
			} else {
				setError("Login não concluído. Verifique as credenciais.");
			}
		})()
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : String(err));
			})
			.finally(() => {
				setIsPending(false);
			});
	};

	return (
		<div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] px-2">
			<Card className="w-full max-w-md bg-white/80 backdrop-blur-md border-gray-200/50 shadow-xl">
				<CardHeader className="text-center px-4 sm:px-6">
					<div className="flex justify-center mb-3 sm:mb-4">
						<div className="p-2.5 sm:p-3 bg-gradient-to-br from-violet-100 via-indigo-100 to-cyan-100 rounded-full">
							<Lock className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600" />
						</div>
					</div>
					<CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-violet-700 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
						Login Administrativo
					</CardTitle>
					<CardDescription className="text-sm">
						Informe suas credenciais para acessar o painel.
					</CardDescription>
				</CardHeader>
				<CardContent className="px-4 sm:px-6">
					{!getSupabaseClient() && (
						<div className="space-y-3 mb-4">
							<div className="text-sm text-gray-700">
								Configure o Supabase para habilitar login/cadastro e o banco de dados.
							</div>
							<div className="space-y-2">
								<Label htmlFor="supabase-url" className="text-sm">Supabase URL</Label>
								<Input
									id="supabase-url"
									type="text"
									placeholder="https://xxxx.supabase.co"
									value={supabaseUrl}
									onChange={(e) => setSupabaseUrl(e.target.value)}
									className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="supabase-key" className="text-sm">Supabase Key</Label>
								<Input
									id="supabase-key"
									type="password"
									placeholder="cole aqui a chave (anon/publishable)"
									value={supabaseKey}
									onChange={(e) => setSupabaseKey(e.target.value)}
									className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
								/>
							</div>
							<Button
								type="button"
								className="w-full h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
								onClick={() => {
									setError("");
									setSuccess("");
									if (!supabaseUrl.trim() || !supabaseKey.trim()) {
										setError("Preencha a URL e a chave do Supabase.");
										return;
									}
									setSupabaseConfig({ url: supabaseUrl.trim(), anonKey: supabaseKey.trim() });
									window.location.reload();
								}}
							>
								Salvar Configuração
							</Button>
						</div>
					)}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Digite o email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								autoComplete="email"
								className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="text-sm">Senha</Label>
							<Input
								id="password"
								type="password"
								placeholder="Digite a senha"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
								className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
							/>
						</div>
						{success && (
							<Alert>
								<AlertDescription className="text-sm">{success}</AlertDescription>
							</Alert>
						)}
						{error && (
							<Alert variant="destructive">
								<AlertDescription className="text-sm">{error}</AlertDescription>
							</Alert>
						)}
						<Button
							type="submit"
							className="w-full h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
							disabled={isPending}
						>
							{isPending
								? "Processando..."
								: "Entrar"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

export function UserLogin() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isCreatingAccount, setIsCreatingAccount] = useState(false);
	const [isPending, setIsPending] = useState(false);

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
			setError("Supabase não configurado. Configure as variáveis no deploy ou acesse o Admin para configurar localmente.");
			return;
		}

		setIsPending(true);
		(async () => {
			if (isCreatingAccount) {
				const { data, error } = await supabase.auth.signUp({ email, password });
				if (error) throw error;
				if (data.session) {
					await navigate({ to: "/biblioteca" });
				} else {
					setSuccess("Conta criada. Se necessário, confirme o email para entrar.");
					setIsCreatingAccount(false);
				}
				return;
			}

			const { data, error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) throw error;
			if (data.session) {
				await navigate({ to: "/biblioteca" });
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
		<div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-100 to-cyan-100 flex items-center justify-center px-3 py-10">
			<Card className="w-full max-w-md bg-white/80 backdrop-blur-md border-white/60 shadow-xl">
				<CardHeader className="px-4 sm:px-6">
					<div className="flex items-center justify-between">
						<Button asChild variant="ghost" size="sm">
							<Link to="/">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Home
							</Link>
						</Button>
					</div>
					<div className="flex justify-center mt-2 mb-3 sm:mb-4">
						<div className="p-2.5 sm:p-3 bg-gradient-to-br from-violet-100 via-indigo-100 to-cyan-100 rounded-full">
							<img
								src="/app_icon.svg"
								alt="SOMLIVRO"
								className="h-10 sm:h-12 w-auto"
							/>
						</div>
					</div>
					<CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-violet-700 via-indigo-600 to-cyan-500 bg-clip-text text-transparent text-center">
						{isCreatingAccount ? "Criar Conta" : "Entrar"}
					</CardTitle>
					<CardDescription className="text-sm text-center">
						{isCreatingAccount ? "Crie sua conta para salvar preferências." : "Acesse sua conta para uma experiência personalizada."}
					</CardDescription>
				</CardHeader>
				<CardContent className="px-4 sm:px-6">
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
								autoComplete={isCreatingAccount ? "new-password" : "current-password"}
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
							className="w-full h-11 sm:h-10 text-base sm:text-sm touch-manipulation bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-600"
							disabled={isPending}
						>
							{isPending ? "Processando..." : isCreatingAccount ? "Criar Conta" : "Entrar"}
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full h-11 sm:h-10 text-base sm:text-sm touch-manipulation bg-white/70"
							onClick={() => {
								setIsCreatingAccount(!isCreatingAccount);
								setError("");
								setSuccess("");
							}}
						>
							{isCreatingAccount ? "Já tenho conta" : "Criar conta"}
						</Button>
						<Button asChild variant="ghost" className="w-full">
							<Link to="/biblioteca">Continuar sem entrar</Link>
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

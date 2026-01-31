import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { Audiobook } from "@/domain/audiobook";
import { AudiobookCatalog } from "@/components/AudiobookCatalog";
import { AudioPlayer } from "@/components/AudioPlayer";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLogin } from "@/components/AdminLogin";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Settings, BookOpen } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase/useSupabaseSession";
import { listAudiobooks } from "@/lib/supabase/audiobooks";

export function AudiobookPlatform(props: { initialAdminMode?: boolean } = {}) {
	const guestPreviewLimit = 2;
	const [selectedAudiobook, setSelectedAudiobook] = useState<Audiobook | null>(null);
	const [isAdminMode, setIsAdminMode] = useState(Boolean(props.initialAdminMode));
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { session, isReady, configError } = useSupabaseSession();
	const adminEmailsRaw = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) || "";
	const adminEmailSet = adminEmailsRaw
		.split(/[,\s]+/g)
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	const isAdminUser = Boolean(session?.user?.email) && adminEmailSet.includes(session.user.email!.toLowerCase());
	const isAdminAuthenticated = Boolean(session) && isAdminUser;
	const isSupabaseConfigured = Boolean(getSupabaseClient());

	// Fetch all audiobooks
	const { data: audiobooks = [], isLoading, error } = useQuery({
		queryKey: ["audiobooks"],
		enabled: isSupabaseConfigured,
		queryFn: async () => {
			return await listAudiobooks();
		},
	});

	const handleAudiobookSelect = (audiobook: Audiobook) => {
		setSelectedAudiobook(audiobook);
	};

	const handleAdminLogin = () => {
		setIsAdminMode(true);
	};

	const handleAdminLogout = () => {
		const supabase = getSupabaseClient();
		if (supabase) {
			supabase.auth.signOut();
		}
		setIsAdminMode(false);
	};

	const handleAudiobookUpdate = () => {
		queryClient.invalidateQueries({ queryKey: ["audiobooks"] });
	};

	if (isReady && !isSupabaseConfigured && !isAdminMode) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-100 via-indigo-100 to-cyan-100 p-4">
				<div className="max-w-lg w-full bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-xl p-5">
					<div className="text-lg font-semibold text-gray-900">Supabase não configurado</div>
					<div className="text-sm text-gray-700 mt-2">
						{configError || "Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no deploy, ou configure pelo Admin."}
					</div>
					<div className="mt-4">
						<Button
							variant="default"
							onClick={() => setIsAdminMode(true)}
						>
							<Settings className="w-4 h-4 mr-2" />
							Configurar no Admin
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-100 via-indigo-100 to-cyan-100">
				<div className="text-lg text-gray-600 animate-pulse">Carregando audiobooks...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-100 via-indigo-100 to-cyan-100 p-4">
				<div className="max-w-lg w-full bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-xl p-5">
					<div className="text-lg font-semibold text-gray-900">Falha ao carregar audiobooks</div>
					<div className="text-sm text-gray-700 mt-2">
						{error instanceof Error ? error.message : "Erro desconhecido"}
					</div>
					<div className="text-sm text-gray-600 mt-3">
						Verifique se o Supabase está configurado e se a tabela <span className="font-mono">audiobooks</span> foi criada.
					</div>
				</div>
			</div>
		);
	}

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	return (
		<div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-100 to-cyan-100 relative">
			{/* Decorative gradient orbs */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-300/55 to-indigo-300/45 rounded-full blur-3xl" />
				<div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-300/45 to-cyan-300/45 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-300/45 to-violet-300/35 rounded-full blur-3xl" />
			</div>
			<header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/50 sticky top-0 z-40">
				<div className="container mx-auto px-3 sm:px-4 py-1 sm:py-2">
					<div className="flex items-center justify-between min-h-[56px] sm:min-h-[64px] md:min-h-[72px]">
						<Link
							to="/"
							className="min-w-0"
							onClick={() => {
								setIsAdminMode(false);
								setSelectedAudiobook(null);
							}}
						>
							<h1 className="truncate">
								<span className="sr-only">SOMLIVRO</span>
								<img
									src="/app_icon.svg"
									alt="SOMLIVRO"
									className="h-12 sm:h-14 md:h-16 w-auto drop-shadow-md"
								/>
							</h1>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden sm:flex items-center gap-2 md:gap-3">
							<Button
								variant="outline"
								onClick={() => {
									setIsAdminMode(false);
									setSelectedAudiobook(null);
									navigate({ to: "/biblioteca" });
								}}
								size="sm"
								className="md:size-default"
							>
								<BookOpen className="w-4 h-4 mr-1 md:mr-2" />
								<span className="hidden md:inline">Biblioteca</span>
								<span className="md:hidden">Biblioteca</span>
							</Button>
							{!session && (
								<Button asChild variant="outline" size="sm" className="md:size-default">
									<Link to="/entrar">
										<span className="hidden md:inline">Entrar</span>
										<span className="md:hidden">Entrar</span>
									</Link>
								</Button>
							)}
							{session && (
								<Button variant="ghost" size="sm" onClick={handleAdminLogout}>
									<LogOut className="w-4 h-4 mr-1 md:mr-2" />
									<span className="hidden md:inline">Sair</span>
								</Button>
							)}
							{isAdminUser && (
								<Button
									variant={isAdminMode ? "default" : "outline"}
									onClick={() => {
										setIsAdminMode(!isAdminMode);
										navigate({ to: isAdminMode ? "/biblioteca" : "/admin" });
									}}
									size="sm"
									className="md:size-default"
								>
									{isAdminMode ? (
										<>
											<BookOpen className="w-4 h-4 mr-1 md:mr-2" />
											<span className="hidden md:inline">Ver Catálogo</span>
											<span className="md:hidden">Catálogo</span>
										</>
									) : (
										<>
											<Settings className="w-4 h-4 mr-1 md:mr-2" />
											<span className="hidden md:inline">Painel Admin</span>
											<span className="md:hidden">Admin</span>
										</>
									)}
								</Button>
							)}
						</div>

						{/* Mobile Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							className="sm:hidden"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</Button>
					</div>

					{/* Mobile Navigation Menu */}
					{isMobileMenuOpen && (
						<div className="sm:hidden mt-3 pt-3 border-t space-y-2">
							<Button
								variant="outline"
								onClick={() => {
									setIsAdminMode(false);
									setSelectedAudiobook(null);
									closeMobileMenu();
									navigate({ to: "/biblioteca" });
								}}
								className="w-full justify-start"
							>
								<BookOpen className="w-4 h-4 mr-2" />
								Biblioteca
							</Button>
							{!session && (
								<Button
									variant="outline"
									onClick={() => {
										closeMobileMenu();
										navigate({ to: "/entrar" });
									}}
									className="w-full justify-start"
								>
									<Settings className="w-4 h-4 mr-2" />
									Entrar
								</Button>
							)}
							{session && (
								<Button
									variant="ghost"
									onClick={() => {
										handleAdminLogout();
										closeMobileMenu();
									}}
									className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									<LogOut className="w-4 h-4 mr-2" />
									Sair
								</Button>
							)}
							{isAdminUser && (
								<Button
									variant={isAdminMode ? "default" : "outline"}
									onClick={() => {
										setIsAdminMode(!isAdminMode);
										navigate({ to: isAdminMode ? "/biblioteca" : "/admin" });
										closeMobileMenu();
									}}
									className="w-full justify-start"
								>
									{isAdminMode ? (
										<>
											<BookOpen className="w-4 h-4 mr-2" />
											Ver Catálogo
										</>
									) : (
										<>
											<Settings className="w-4 h-4 mr-2" />
											Painel Admin
										</>
									)}
								</Button>
							)}
						</div>
					)}
				</div>
				<div className="h-px w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />
			</header>

			<main
				className={`container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 relative z-10 ${
					selectedAudiobook && !isAdminMode && !isMobileMenuOpen
						? "pb-[calc(12rem+env(safe-area-inset-bottom))] sm:pb-[calc(10rem+env(safe-area-inset-bottom))]"
						: ""
				}`}
			>
				{isAdminMode ? (
					isAdminAuthenticated ? (
						<AdminDashboard
							audiobooks={audiobooks}
							onUpdate={handleAudiobookUpdate}
						/>
					) : session ? (
						<div className="max-w-lg w-full bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-xl p-5 mx-auto">
							<div className="text-lg font-semibold text-gray-900">Acesso negado</div>
							<div className="text-sm text-gray-700 mt-2">
								Este usuário não tem permissão de administrador.
							</div>
							<div className="mt-4 flex gap-2">
								<Button
									variant="outline"
									onClick={() => {
										setIsAdminMode(false);
										navigate({ to: "/biblioteca" });
									}}
								>
									Voltar para Biblioteca
								</Button>
								<Button
									variant="ghost"
									onClick={handleAdminLogout}
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									Sair
								</Button>
							</div>
						</div>
					) : (
						<AdminLogin onLogin={handleAdminLogin} />
					)
				) : (
					<div className="space-y-4">
						{!session && (
							<div className="bg-white/80 backdrop-blur-md border border-white/60 shadow-lg rounded-xl p-4 sm:p-5">
								<div className="text-sm sm:text-base font-semibold text-gray-900">
									Prévia da biblioteca
								</div>
								<div className="text-xs sm:text-sm text-gray-700 mt-1">
									Visitantes podem ver até {guestPreviewLimit} títulos. Para liberar o catálogo completo, faça seu cadastro e entre.
								</div>
								<div className="mt-3 flex flex-col sm:flex-row gap-2">
									<Button
										asChild
										className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-600"
									>
										<Link to="/entrar">Criar conta / Entrar</Link>
									</Button>
									<Button
										variant="outline"
										className="bg-white/70"
										onClick={() => setSelectedAudiobook(null)}
									>
										Continuar como visitante
									</Button>
								</div>
							</div>
						)}
						<AudiobookCatalog
							audiobooks={session ? audiobooks : audiobooks.slice(0, guestPreviewLimit)}
							onSelect={handleAudiobookSelect}
							selectedId={selectedAudiobook?.id}
						/>
					</div>
				)}
			</main>

			{/* Fixed Audio Player - Outside main content for proper positioning */}
			{selectedAudiobook && !isAdminMode && !isMobileMenuOpen && (
				<AudioPlayer key={selectedAudiobook.id} audiobook={selectedAudiobook} />
			)}
		</div>
	);
}

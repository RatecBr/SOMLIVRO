import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export function AudiobookPlatform() {
	const [selectedAudiobook, setSelectedAudiobook] = useState<Audiobook | null>(null);
	const [isAdminMode, setIsAdminMode] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const queryClient = useQueryClient();
	const { session, isReady, configError } = useSupabaseSession();
	const isAdminAuthenticated = Boolean(session);
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
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50 p-4">
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
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50">
				<div className="text-lg text-gray-600 animate-pulse">Carregando audiobooks...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50 p-4">
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
		<div className="min-h-screen bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50 relative">
			{/* Decorative gradient orbs */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl" />
				<div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl" />
			</div>
			<header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/50 sticky top-0 z-40">
				<div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
					<div className="flex items-center justify-between">
						<h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 bg-clip-text text-transparent truncate">
							SOMLIVRO
						</h1>

						{/* Desktop Navigation */}
						<div className="hidden sm:flex items-center gap-2 md:gap-3">
							{isAdminAuthenticated && (
								<Button
									variant={isAdminMode ? "default" : "outline"}
									onClick={() => setIsAdminMode(!isAdminMode)}
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
							{!isAdminMode && !isAdminAuthenticated && (
								<Button
									variant="outline"
									onClick={() => setIsAdminMode(true)}
									size="sm"
								>
									<Settings className="w-4 h-4 mr-1 md:mr-2" />
									<span className="hidden md:inline">Login Admin</span>
									<span className="md:hidden">Entrar</span>
								</Button>
							)}
							{isAdminAuthenticated && (
								<Button variant="ghost" size="sm" onClick={handleAdminLogout}>
									<LogOut className="w-4 h-4 mr-1 md:mr-2" />
									<span className="hidden md:inline">Sair</span>
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
							{isAdminAuthenticated && (
								<Button
									variant={isAdminMode ? "default" : "outline"}
									onClick={() => {
										setIsAdminMode(!isAdminMode);
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
							{!isAdminMode && !isAdminAuthenticated && (
								<Button
									variant="outline"
									onClick={() => {
										setIsAdminMode(true);
										closeMobileMenu();
									}}
									className="w-full justify-start"
								>
									<Settings className="w-4 h-4 mr-2" />
									Login Admin
								</Button>
							)}
							{isAdminAuthenticated && (
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
						</div>
					)}
				</div>
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
					) : (
						<AdminLogin onLogin={handleAdminLogin} />
					)
				) : (
					<AudiobookCatalog
						audiobooks={audiobooks}
						onSelect={handleAudiobookSelect}
						selectedId={selectedAudiobook?.id}
					/>
				)}
			</main>

			{/* Fixed Audio Player - Outside main content for proper positioning */}
			{selectedAudiobook && !isAdminMode && !isMobileMenuOpen && (
				<AudioPlayer key={selectedAudiobook.id} audiobook={selectedAudiobook} />
			)}
		</div>
	);
}

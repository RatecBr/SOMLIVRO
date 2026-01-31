import type * as React from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Headphones, Sparkles, Play, ArrowRight } from "lucide-react";
import type { Audiobook } from "@/domain/audiobook";
import { listAudiobooks } from "@/lib/supabase/audiobooks";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Feature = {
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
};

export function LandingPage() {
	const isSupabaseConfigured = Boolean(getSupabaseClient());
	const { data: audiobooks = [] } = useQuery({
		queryKey: ["audiobooks", "landing"],
		enabled: isSupabaseConfigured,
		queryFn: async () => {
			return await listAudiobooks();
		},
	});

	const featured = useMemo(() => audiobooks.slice(0, 8), [audiobooks]);

	const features: Feature[] = [
		{
			title: "Ouça do seu jeito",
			description: "Ajuste a velocidade e continue exatamente de onde parou.",
			icon: Headphones,
		},
		{
			title: "Biblioteca organizada",
			description: "Catálogo com capas, categorias e busca rápida por temas.",
			icon: Sparkles,
		},
		{
			title: "Acesso simples",
			description: "Entre e libere o catálogo completo para ouvir sem limites.",
			icon: ArrowRight,
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-100 to-cyan-100">
			<header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/50">
				<div className="container mx-auto px-3 sm:px-4 py-1 sm:py-2 flex items-center justify-between min-h-[56px] sm:min-h-[64px] md:min-h-[72px]">
					<div className="flex items-center gap-3 min-w-0">
						<img src="/app_icon.svg" alt="SOMLIVRO" className="h-12 sm:h-14 md:h-16 w-auto drop-shadow-md" />
					</div>
					<div className="flex items-center gap-2">
						<Button asChild variant="ghost" className="hidden sm:inline-flex">
							<Link to="/biblioteca">
								<Play className="mr-2 h-4 w-4" />
								Explorar
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link to="/entrar">
								<ArrowRight className="mr-2 h-4 w-4" />
								Entrar
							</Link>
						</Button>
					</div>
				</div>
				<div className="h-px w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />
			</header>

			<main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
				<section className="grid lg:grid-cols-2 gap-6 sm:gap-10 items-center">
					<div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
							Sua biblioteca de audiobooks,{" "}
							<span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
								do seu jeito
							</span>
							.
						</h1>
						<p className="mt-4 text-base sm:text-lg text-gray-700 max-w-xl">
							Descubra histórias, dê play e ouça no seu ritmo. Comece grátis e faça seu cadastro para liberar o catálogo completo.
						</p>
						<div className="mt-6 flex flex-col sm:flex-row gap-3">
							<Button asChild className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-600">
								<Link to="/biblioteca">
									<Play className="mr-2 h-4 w-4" />
									Abrir Biblioteca (Grátis)
								</Link>
							</Button>
							<Button asChild variant="outline" className="bg-white/70">
								<Link to="/entrar">
									Criar conta grátis / Entrar
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
						<div className="mt-6 grid sm:grid-cols-3 gap-3">
							{features.map((f) => (
								<Card key={f.title} className="bg-white/70 backdrop-blur-sm border-white/60">
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2">
											<f.icon className="h-4 w-4 text-indigo-600" />
											{f.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="text-xs text-gray-700">
										{f.description}
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					<div className="relative">
						<div className="absolute -inset-6 bg-gradient-to-br from-violet-300/50 via-indigo-300/35 to-cyan-300/45 rounded-3xl blur-2xl" />
						<div className="relative rounded-2xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-xl overflow-hidden">
							<div className="p-5 sm:p-6">
								<div className="text-sm font-semibold text-gray-900">Nós temos o que todo mundo está ouvindo</div>
								<div className="text-xs text-gray-600 mt-1">
									Dos títulos quentes aos clássicos — escolha um e dê play.
								</div>
								<div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
									{(featured.length > 0 ? featured : Array.from({ length: 6 }).map((_, i) => ({ id: `s-${i}` } as unknown as Audiobook))).map((audiobook) => (
										<div
											key={audiobook.id}
											className={cn(
												"rounded-xl border border-white/70 bg-white/70 overflow-hidden",
												featured.length === 0 && "animate-pulse",
											)}
										>
											<div className="aspect-square bg-gradient-to-br from-violet-100 via-indigo-50 to-cyan-100">
												{featured.length > 0 && audiobook.cover_image_url ? (
													<img
														src={audiobook.cover_image_url}
														alt={audiobook.title}
														className="w-full h-full object-cover"
														loading="lazy"
													/>
												) : null}
											</div>
											<div className="p-2">
												<div className="text-xs font-semibold text-gray-900 line-clamp-2">
													{featured.length > 0 ? audiobook.title : " "}
												</div>
												<div className="text-[11px] text-gray-600 line-clamp-1">
													{featured.length > 0 ? audiobook.author || " " : " "}
												</div>
											</div>
										</div>
									))}
								</div>
								<div className="mt-5 flex justify-end">
									<Button asChild variant="ghost" className="text-indigo-700 hover:text-indigo-800">
										<Link to="/biblioteca">
											Ver catálogo completo
											<ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="mt-10 sm:mt-16">
					<div className="rounded-2xl border border-white/60 bg-white/65 backdrop-blur-sm shadow-lg overflow-hidden">
						<div className="p-6 sm:p-8 grid lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2">
								<div className="text-sm font-semibold text-gray-900">Como funciona</div>
								<div className="mt-2 grid sm:grid-cols-3 gap-3">
									<Card className="bg-white/70 border-white/60">
										<CardHeader className="pb-2">
											<CardTitle className="text-sm">1) Explore</CardTitle>
										</CardHeader>
										<CardContent className="text-xs text-gray-700">
											Veja uma prévia da biblioteca e encontre o que combinar com o seu momento.
										</CardContent>
									</Card>
									<Card className="bg-white/70 border-white/60">
										<CardHeader className="pb-2">
											<CardTitle className="text-sm">2) Entre</CardTitle>
										</CardHeader>
										<CardContent className="text-xs text-gray-700">
											Crie sua conta para acessar o catálogo completo e continuar de onde parou.
										</CardContent>
									</Card>
									<Card className="bg-white/70 border-white/60">
										<CardHeader className="pb-2">
											<CardTitle className="text-sm">3) Dê play</CardTitle>
										</CardHeader>
										<CardContent className="text-xs text-gray-700">
											Escolha um título, controle a velocidade e aproveite a jornada.
										</CardContent>
									</Card>
								</div>
							</div>
							<div className="flex flex-col justify-between">
								<div>
									<div className="text-sm font-semibold text-gray-900">Pronto para começar?</div>
									<div className="text-xs text-gray-700 mt-2">
										Acesse uma prévia grátis agora. Para ver o catálogo completo, faça seu cadastro grátis e entre.
									</div>
								</div>
								<div className="mt-4 flex flex-col gap-2">
									<Button asChild className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-700 hover:via-indigo-700 hover:to-cyan-600">
										<Link to="/biblioteca">Abrir Biblioteca (Grátis)</Link>
									</Button>
									<Button asChild variant="outline" className="bg-white/70">
										<Link to="/entrar">Cadastrar grátis / Entrar</Link>
									</Button>
								</div>
							</div>
						</div>
						<div className="h-px w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />
						<div className="px-6 sm:px-8 py-4 text-xs text-gray-600 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
							<div>© {new Date().getFullYear()} SOMLIVRO</div>
							<div className="flex items-center gap-4">
								<Link to="/biblioteca" className="text-indigo-700 hover:text-indigo-800">Biblioteca</Link>
								<Link to="/entrar" className="text-indigo-700 hover:text-indigo-800">Entrar</Link>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

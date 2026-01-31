import { useState, useMemo } from "react";
import type { Audiobook } from "@/domain/audiobook";
import { AudiobookCategory } from "@/domain/audiobook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlayCircle, BookOpen, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryLabel } from "@/domain/audiobookCategories";

// Category filter options
const CATEGORY_FILTERS = [
	{ value: AudiobookCategory.Ficcao, label: "Ficção" },
	{ value: AudiobookCategory.NaoFiccao, label: "Não Ficção" },
	{ value: AudiobookCategory.Literatura, label: "Literatura" },
	{ value: AudiobookCategory.Autoajuda, label: "Autodesenvolvimento" },
	{ value: AudiobookCategory.Empreendedorismo, label: "Empreendedorismo" },
];

interface AudiobookCatalogProps {
	audiobooks: Audiobook[];
	onSelect: (audiobook: Audiobook) => void;
	selectedId?: string;
}

export function AudiobookCatalog({ audiobooks, onSelect, selectedId }: AudiobookCatalogProps) {
	const [selectedFilters, setSelectedFilters] = useState<AudiobookCategory[]>([]);
	const [showFilters, setShowFilters] = useState(false);

	// Filter audiobooks based on selected categories
	const filteredAudiobooks = useMemo(() => {
		if (selectedFilters.length === 0) {
			return audiobooks;
		}
		return audiobooks.filter((audiobook) => {
			// Check if audiobook has any of the selected categories
			const audiobookCategories: AudiobookCategory[] = Array.isArray(audiobook.categories)
				? audiobook.categories.filter((c): c is AudiobookCategory => typeof c === "number" && c > 0)
				: audiobook.category && audiobook.category > 0
					? [audiobook.category]
					: [];
			return selectedFilters.some((filter) => audiobookCategories.includes(filter));
		});
	}, [audiobooks, selectedFilters]);

	const toggleFilter = (category: AudiobookCategory) => {
		setSelectedFilters((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	const clearFilters = () => {
		setSelectedFilters([]);
	};

	// Helper to get categories for display
	const getAudiobookCategories = (audiobook: Audiobook): AudiobookCategory[] => {
		if (Array.isArray(audiobook.categories)) {
			return audiobook.categories.filter((c): c is AudiobookCategory => typeof c === "number" && c > 0);
		}
		if (audiobook.category && audiobook.category > 0) {
			return [audiobook.category];
		}
		return [];
	};

	if (audiobooks.length === 0) {
		return (
			<div className="text-center py-12 sm:py-16">
				<BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
				<h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Nenhum Audiobook Ainda</h3>
				<p className="text-sm sm:text-base text-gray-500">O catálogo está vazio. Volte em breve!</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
				<h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">Catálogo de Audiobooks</h2>
				<button
					onClick={() => setShowFilters(!showFilters)}
					className={cn(
						"flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm touch-manipulation shadow-sm",
						showFilters || selectedFilters.length > 0
							? "bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-300 text-violet-700"
							: "bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-white hover:shadow-md"
					)}
				>
					<Filter className="w-4 h-4" />
					<span>Filtrar</span>
					{selectedFilters.length > 0 && (
						<Badge variant="secondary" className="ml-1 bg-violet-100 text-violet-700">
							{selectedFilters.length}
						</Badge>
					)}
				</button>
			</div>

			{/* Filter Panel */}
			{showFilters && (
				<Card className="mb-4 sm:mb-6 bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
					<CardContent className="p-3 sm:p-4">
						<div className="flex flex-wrap items-center justify-between gap-2 mb-3">
							<span className="text-sm font-medium text-gray-700">Filtrar por categoria:</span>
							{selectedFilters.length > 0 && (
								<button
									onClick={clearFilters}
									className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 touch-manipulation"
								>
									<X className="w-4 h-4" />
									Limpar filtros
								</button>
							)}
						</div>
						<div className="flex flex-wrap gap-2 sm:gap-3">
							{CATEGORY_FILTERS.map((option) => (
								<div key={option.value} className="flex items-center space-x-2">
									<Checkbox
										id={`filter-${option.value}`}
										checked={selectedFilters.includes(option.value)}
										onCheckedChange={() => toggleFilter(option.value)}
									/>
									<Label
										htmlFor={`filter-${option.value}`}
										className="text-sm font-normal cursor-pointer"
									>
										{option.label}
									</Label>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Results count */}
			{selectedFilters.length > 0 && (
				<p className="text-sm text-gray-600 mb-3">
					{filteredAudiobooks.length} audiobook{filteredAudiobooks.length !== 1 ? "s" : ""} encontrado{filteredAudiobooks.length !== 1 ? "s" : ""}
				</p>
			)}

			{filteredAudiobooks.length === 0 ? (
				<div className="text-center py-8 sm:py-12">
					<BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3" />
					<p className="text-gray-600">Nenhum audiobook encontrado com os filtros selecionados.</p>
					<button
						onClick={clearFilters}
						className="mt-3 text-blue-600 hover:text-blue-700 text-sm touch-manipulation"
					>
						Limpar filtros
					</button>
				</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
					{filteredAudiobooks.map((audiobook) => {
						const categories = getAudiobookCategories(audiobook);
						return (
							<div
								key={audiobook.id}
								onClick={() => {
									console.log("Audiobook clicked:", audiobook.id);
									onSelect(audiobook);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onSelect(audiobook);
									}
								}}
								role="button"
								tabIndex={0}
								className={cn(
									"group active:scale-95 sm:hover:shadow-xl transition-all duration-200 sm:duration-300 cursor-pointer border touch-manipulation bg-white/80 backdrop-blur-sm overflow-hidden rounded-xl",
									selectedId === audiobook.id
										? "border-violet-400 shadow-lg shadow-violet-100 sm:scale-105 ring-2 ring-violet-200"
										: "border-gray-200/50 sm:hover:border-violet-200 sm:hover:shadow-violet-100/50"
								)}
							>
								<CardHeader className="p-0">
									<div className="relative aspect-square overflow-hidden rounded-t-lg bg-gradient-to-br from-violet-100 via-fuchsia-50 to-rose-100">
										{audiobook.cover_image_url ? (
											<img
												src={audiobook.cover_image_url}
												alt={audiobook.title}
												className="w-full h-full object-cover sm:group-hover:scale-110 transition-transform duration-300"
												loading="lazy"
											/>
										) : (
											<div className="flex items-center justify-center h-full">
												<BookOpen className="w-12 h-12 sm:w-16 md:w-24 sm:h-16 md:h-24 text-gray-400" />
											</div>
										)}
										<div className="absolute inset-0 bg-black/0 sm:group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
											<PlayCircle className="w-10 h-10 sm:w-12 md:w-16 sm:h-12 md:h-16 text-white opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />
										</div>
										{/* Mobile play indicator for selected */}
										{selectedId === audiobook.id && (
											<div className="absolute inset-0 bg-black/30 flex items-center justify-center sm:hidden">
												<PlayCircle className="w-10 h-10 text-white" />
											</div>
										)}
									</div>
								</CardHeader>
								<CardContent className="p-2 sm:p-3 md:p-4">
									<CardTitle className="text-sm sm:text-base md:text-lg line-clamp-2 mb-1 sm:mb-2">
										{audiobook.title}
									</CardTitle>
									{audiobook.author && (
										<CardDescription className="text-xs sm:text-sm line-clamp-1">
											{audiobook.author}
										</CardDescription>
									)}
									{categories.length > 0 && (
										<div className="flex flex-wrap gap-1 mb-1">
											{categories.slice(0, 2).map((cat) => (
												<Badge key={cat} variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
													{getCategoryLabel(cat)}
												</Badge>
											))}
											{categories.length > 2 && (
												<Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
													+{categories.length - 2}
												</Badge>
											)}
										</div>
									)}
									{audiobook.duration && (
										<CardDescription className="text-xs sm:text-sm">
											{audiobook.duration}
										</CardDescription>
									)}
								</CardContent>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

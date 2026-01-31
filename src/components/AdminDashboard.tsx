import { useState } from "react";
import type { Audiobook } from "@/domain/audiobook";
import { AudiobookCategory } from "@/domain/audiobook";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaInput } from "@/components/MediaInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { createAudiobook, deleteAudiobook, updateAudiobook } from "@/lib/supabase/audiobooks";
import { AUDIOBOOK_CATEGORY_OPTIONS } from "@/domain/audiobookCategories";

interface AdminDashboardProps {
	audiobooks: Audiobook[];
	onUpdate: () => void;
}

export function AdminDashboard({ audiobooks, onUpdate }: AdminDashboardProps) {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editingAudiobook, setEditingAudiobook] = useState<Audiobook | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		author: "",
		coverImageUrl: "",
		audioFileUrl: "",
		duration: "",
		selectedCategories: [] as AudiobookCategory[],
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const resetForm = () => {
		setFormData({
			title: "",
			author: "",
			coverImageUrl: "",
			audioFileUrl: "",
			duration: "",
			selectedCategories: [],
		});
		setError("");
		setSuccess("");
	};

	const addAudiobookMutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			await createAudiobook({
				title: data.title,
				author: data.author || null,
				cover_image_url: data.coverImageUrl || null,
				audio_file_url: data.audioFileUrl,
				duration: data.duration || null,
				categories: data.selectedCategories.length > 0 ? data.selectedCategories : null,
				category: data.selectedCategories[0] || AudiobookCategory.Unspecified,
			});
		},
		onSuccess: () => {
			setSuccess("Audiobook adicionado com sucesso!");
			resetForm();
			setIsAddDialogOpen(false);
			onUpdate();
		},
		onError: (err: Error) => {
			setError(err.message);
		},
	});

	const updateAudiobookMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
			await updateAudiobook(id, {
				title: data.title,
				author: data.author || null,
				cover_image_url: data.coverImageUrl || null,
				audio_file_url: data.audioFileUrl,
				duration: data.duration || null,
				categories: data.selectedCategories.length > 0 ? data.selectedCategories : null,
				category: data.selectedCategories[0] || AudiobookCategory.Unspecified,
			});
		},
		onSuccess: () => {
			setSuccess("Audiobook atualizado com sucesso!");
			setEditingAudiobook(null);
			resetForm();
			onUpdate();
		},
		onError: (err: Error) => {
			setError(err.message);
		},
	});

	const deleteAudiobookMutation = useMutation({
		mutationFn: async (id: string) => {
			await deleteAudiobook(id);
		},
		onSuccess: () => {
			setSuccess("Audiobook excluído com sucesso!");
			onUpdate();
		},
		onError: (err: Error) => {
			setError(err.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!formData.title || !formData.audioFileUrl) {
			setError("Título e arquivo de áudio são obrigatórios");
			return;
		}

		if (editingAudiobook) {
			updateAudiobookMutation.mutate({ id: editingAudiobook.id, data: formData });
		} else {
			addAudiobookMutation.mutate(formData);
		}
	};

	const handleEdit = (audiobook: Audiobook) => {
		setEditingAudiobook(audiobook);
		// Extract categories from the audiobook (stored as array of enum values)
		const existingCategories: AudiobookCategory[] = Array.isArray(audiobook.categories)
			? audiobook.categories.filter((c): c is AudiobookCategory => typeof c === "number" && c > 0)
			: audiobook.category && audiobook.category > 0
				? [audiobook.category]
				: [];
		setFormData({
			title: audiobook.title,
			author: audiobook.author ?? "",
			coverImageUrl: audiobook.cover_image_url ?? "",
			audioFileUrl: audiobook.audio_file_url,
			duration: audiobook.duration || "",
			selectedCategories: existingCategories,
		});
		setError("");
		setSuccess("");
	};

	const handleCancelEdit = () => {
		setEditingAudiobook(null);
		resetForm();
	};

	const handleDelete = (id: string) => {
		if (confirm("Tem certeza que deseja excluir este audiobook?")) {
			deleteAudiobookMutation.mutate(id);
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">Painel Administrativo</h2>
					<p className="text-sm sm:text-base text-gray-600 mt-1">Gerencie sua coleção de audiobooks</p>
				</div>
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button size="default" className="w-full sm:w-auto touch-manipulation bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-200">
							<Plus className="w-5 h-5 mr-2" />
							Adicionar Audiobook
						</Button>
					</DialogTrigger>
					<DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto mx-auto bg-white/95 backdrop-blur-md">
						<DialogHeader>
							<DialogTitle>Adicionar Novo Audiobook</DialogTitle>
							<DialogDescription>
								Envie arquivos ou use links da nuvem (Google Drive, Dropbox) para adicionar um audiobook
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Título *</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Digite o título do audiobook"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="author">Nome do Autor</Label>
								<Input
									id="author"
									value={formData.author}
									onChange={(e) => setFormData({ ...formData, author: e.target.value })}
									placeholder="Digite o nome do autor"
								/>
							</div>

							<MediaInput
								label="Imagem de Capa"
								accept="image/*"
								value={formData.coverImageUrl}
								onChange={(url: string) => setFormData({ ...formData, coverImageUrl: url })}
								uploadLabel="Enviar Imagem de Capa"
								linkPlaceholder="https://drive.google.com/... ou URL da imagem"
								showPreview
								previewType="image"
							/>

							<MediaInput
								label="Arquivo de Áudio"
								accept="audio/*"
								value={formData.audioFileUrl}
								onChange={(url: string) => setFormData({ ...formData, audioFileUrl: url })}
								onNameDetected={(name) =>
									setFormData((prev) =>
										prev.title.trim() ? prev : { ...prev, title: name },
									)
								}
								uploadLabel="Enviar Arquivo de Áudio"
								linkPlaceholder="https://drive.google.com/... ou https://dropbox.com/..."
								required
							/>

							<div className="space-y-2">
								<Label htmlFor="duration">Duração (opcional)</Label>
								<Input
									id="duration"
									value={formData.duration}
									onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
									placeholder="ex: 2h 30m"
								/>
							</div>

							<div className="space-y-3">
								<Label>Categorias / Temas</Label>
								<div className="grid grid-cols-2 gap-2">
									{AUDIOBOOK_CATEGORY_OPTIONS.map((option) => (
										<div key={option.value} className="flex items-center space-x-2">
											<Checkbox
												id={`add-category-${option.value}`}
												checked={formData.selectedCategories.includes(option.value)}
												onCheckedChange={(checked) => {
													if (checked) {
														setFormData({
															...formData,
															selectedCategories: [...formData.selectedCategories, option.value],
														});
													} else {
														setFormData({
															...formData,
															selectedCategories: formData.selectedCategories.filter(
																(c) => c !== option.value
															),
														});
													}
												}}
											/>
											<Label
												htmlFor={`add-category-${option.value}`}
												className="text-sm font-normal cursor-pointer"
											>
												{option.label}
											</Label>
										</div>
									))}
								</div>
							</div>

							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsAddDialogOpen(false);
										resetForm();
									}}
									className="w-full sm:w-auto touch-manipulation"
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={addAudiobookMutation.isPending}
									className="w-full sm:w-auto touch-manipulation"
								>
									{addAudiobookMutation.isPending ? "Adicionando..." : "Adicionar Audiobook"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{success && (
				<Alert>
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			{editingAudiobook && (
				<Card className="border-violet-400 bg-white/80 backdrop-blur-sm shadow-lg">
					<CardHeader>
						<CardTitle className="bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">Editar Audiobook</CardTitle>
						<CardDescription>Atualize as informações do audiobook</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="edit-title">Título *</Label>
								<Input
									id="edit-title"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Digite o título do audiobook"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="edit-author">Nome do Autor</Label>
								<Input
									id="edit-author"
									value={formData.author}
									onChange={(e) => setFormData({ ...formData, author: e.target.value })}
									placeholder="Digite o nome do autor"
								/>
							</div>

							<MediaInput
								label="Imagem de Capa"
								accept="image/*"
								value={formData.coverImageUrl}
								onChange={(url: string) => setFormData({ ...formData, coverImageUrl: url })}
								uploadLabel="Enviar Nova Imagem de Capa"
								linkPlaceholder="https://drive.google.com/... ou URL da imagem"
								showPreview
								previewType="image"
							/>

							<MediaInput
								label="Arquivo de Áudio"
								accept="audio/*"
								value={formData.audioFileUrl}
								onChange={(url: string) => setFormData({ ...formData, audioFileUrl: url })}
								onNameDetected={(name) =>
									setFormData((prev) =>
										prev.title.trim() ? prev : { ...prev, title: name },
									)
								}
								uploadLabel="Enviar Novo Arquivo de Áudio"
								linkPlaceholder="https://drive.google.com/... ou https://dropbox.com/..."
								required
							/>

							<div className="space-y-2">
								<Label htmlFor="edit-duration">Duração (opcional)</Label>
								<Input
									id="edit-duration"
									value={formData.duration}
									onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
									placeholder="ex: 2h 30m"
								/>
							</div>

							<div className="space-y-3">
								<Label>Categorias / Temas</Label>
								<div className="grid grid-cols-2 gap-2">
									{AUDIOBOOK_CATEGORY_OPTIONS.map((option) => (
										<div key={option.value} className="flex items-center space-x-2">
											<Checkbox
												id={`edit-category-${option.value}`}
												checked={formData.selectedCategories.includes(option.value)}
												onCheckedChange={(checked) => {
													if (checked) {
														setFormData({
															...formData,
															selectedCategories: [...formData.selectedCategories, option.value],
														});
													} else {
														setFormData({
															...formData,
															selectedCategories: formData.selectedCategories.filter(
																(c) => c !== option.value
															),
														});
													}
												}}
											/>
											<Label
												htmlFor={`edit-category-${option.value}`}
												className="text-sm font-normal cursor-pointer"
											>
												{option.label}
											</Label>
										</div>
									))}
								</div>
							</div>

							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
								<Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto touch-manipulation">
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={updateAudiobookMutation.isPending}
									className="w-full sm:w-auto touch-manipulation"
								>
									{updateAudiobookMutation.isPending ? "Atualizando..." : "Atualizar Audiobook"}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			<div>
				<h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">Gerenciar Audiobooks ({audiobooks.length})</h3>
				{audiobooks.length === 0 ? (
					<Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
						<CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
							<BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-violet-300 mb-3 sm:mb-4" />
							<p className="text-sm sm:text-base text-gray-600 text-center px-4">
								Nenhum audiobook ainda. Clique em "Adicionar Audiobook" para começar.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-3 sm:gap-4">
						{audiobooks.map((audiobook) => (
							<Card key={audiobook.id} className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow">
								<CardContent className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
									{audiobook.cover_image_url ? (
										<img
											src={audiobook.cover_image_url}
											alt={audiobook.title}
											className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
											loading="lazy"
										/>
									) : (
										<div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
											<BookOpen className="w-7 h-7 sm:w-10 sm:h-10 text-gray-400" />
										</div>
									)}
									<div className="flex-1 min-w-0">
										<h4 className="font-semibold text-sm sm:text-lg line-clamp-1">{audiobook.title}</h4>
										{audiobook.author && (
											<p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
												{audiobook.author}
											</p>
										)}
										{audiobook.duration && (
											<p className="text-xs sm:text-sm text-gray-600">{audiobook.duration}</p>
										)}
										<p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
											Criado em: {new Date(audiobook.created_at).toLocaleDateString("pt-BR")}
										</p>
									</div>
									<div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
										<Button
											variant="outline"
											size="icon"
											onClick={() => handleEdit(audiobook)}
											className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
										>
											<Pencil className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="icon"
											onClick={() => handleDelete(audiobook.id)}
											disabled={deleteAudiobookMutation.isPending}
											className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
										>
											<Trash2 className="w-4 h-4 text-red-600" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

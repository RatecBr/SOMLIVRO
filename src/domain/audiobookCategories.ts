import { AudiobookCategory } from "./audiobook";

export const AUDIOBOOK_CATEGORY_OPTIONS = [
	{ value: AudiobookCategory.Ficcao, label: "Ficção" },
	{ value: AudiobookCategory.NaoFiccao, label: "Não Ficção" },
	{ value: AudiobookCategory.Literatura, label: "Literatura" },
	{ value: AudiobookCategory.Autoajuda, label: "Autodesenvolvimento" },
	{ value: AudiobookCategory.Empreendedorismo, label: "Empreendedorismo" },
] as const;

export function getCategoryLabel(category: AudiobookCategory): string {
	const found = AUDIOBOOK_CATEGORY_OPTIONS.find((opt) => opt.value === category);
	return found?.label || "";
}

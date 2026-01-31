export enum AudiobookCategory {
	Unspecified = 0,
	Ficcao = 1,
	NaoFiccao = 2,
	Literatura = 3,
	Autoajuda = 4,
	Empreendedorismo = 5,
}

export interface Audiobook {
	id: string;
	title: string;
	author: string | null;
	cover_image_url: string | null;
	audio_file_url: string;
	duration: string | null;
	categories: AudiobookCategory[] | null;
	category: AudiobookCategory;
	created_at: string;
	updated_at: string;
}

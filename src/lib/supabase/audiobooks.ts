import type { Audiobook, AudiobookCategory } from "@/domain/audiobook";
import { getSupabaseClient } from "./client";

type AudiobookRow = {
	id: string;
	title: string;
	author: string | null;
	cover_image_url: string | null;
	audio_file_url: string;
	duration: string | null;
	categories: number[] | null;
	category: number | null;
	created_at: string;
	updated_at: string;
};

function requireSupabase() {
	const supabase = getSupabaseClient();
	if (!supabase) {
		throw new Error("Supabase não configurado.");
	}
	return supabase;
}

function normalizeRow(row: AudiobookRow): Audiobook {
	const category = (row.category ?? 0) as AudiobookCategory;
	const categories = Array.isArray(row.categories)
		? (row.categories.filter((c) => typeof c === "number") as AudiobookCategory[])
		: null;

	return {
		id: row.id,
		title: row.title,
		author: row.author ?? null,
		cover_image_url: row.cover_image_url,
		audio_file_url: row.audio_file_url,
		duration: row.duration,
		categories,
		category,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
}

export async function listAudiobooks(): Promise<Audiobook[]> {
	const supabase = requireSupabase();
	const { data, error } = await supabase
		.from("audiobooks")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return (data as AudiobookRow[]).map(normalizeRow);
}

export async function createAudiobook(input: {
	title: string;
	author: string | null;
	cover_image_url: string | null;
	audio_file_url: string;
	duration: string | null;
	categories: AudiobookCategory[] | null;
	category: AudiobookCategory;
}): Promise<Audiobook> {
	const supabase = requireSupabase();
	let payload: Record<string, unknown> = {
		title: input.title,
		author: input.author,
		cover_image_url: input.cover_image_url,
		audio_file_url: input.audio_file_url,
		duration: input.duration,
		categories: input.categories ?? null,
		category: input.category,
	};

	let { data, error } = await supabase
		.from("audiobooks")
		.insert(payload)
		.select("*")
		.single();

	if (error && error.message.toLowerCase().includes("author")) {
		payload = { ...payload };
		delete payload.author;
		({ data, error } = await supabase
			.from("audiobooks")
			.insert(payload)
			.select("*")
			.single());
	}

	if (error) throw new Error(error.message);
	return normalizeRow(data as AudiobookRow);
}

export async function updateAudiobook(
	id: string,
	input: {
		title: string;
		author: string | null;
		cover_image_url: string | null;
		audio_file_url: string;
		duration: string | null;
		categories: AudiobookCategory[] | null;
		category: AudiobookCategory;
	},
): Promise<Audiobook> {
	const supabase = requireSupabase();
	let payload: Record<string, unknown> = {
		title: input.title,
		author: input.author,
		cover_image_url: input.cover_image_url,
		audio_file_url: input.audio_file_url,
		duration: input.duration,
		categories: input.categories ?? null,
		category: input.category,
	};

	let { data, error } = await supabase
		.from("audiobooks")
		.update(payload)
		.eq("id", id)
		.select("*")
		.single();

	if (error && error.message.toLowerCase().includes("author")) {
		payload = { ...payload };
		delete payload.author;
		({ data, error } = await supabase
			.from("audiobooks")
			.update(payload)
			.eq("id", id)
			.select("*")
			.single());
	}

	if (error) throw new Error(error.message);
	return normalizeRow(data as AudiobookRow);
}

export async function deleteAudiobook(id: string): Promise<void> {
	const supabase = requireSupabase();
	const { error } = await supabase.from("audiobooks").delete().eq("id", id);
	if (error) throw new Error(error.message);
}

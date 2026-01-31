import { getSupabaseClient } from "./client";

export async function uploadPublicFile(options: {
	bucket: string;
	pathPrefix: string;
	file: File;
}): Promise<string> {
	const supabase = getSupabaseClient();
	if (!supabase) {
		throw new Error("Supabase não configurado.");
	}

	const extension = options.file.name.includes(".")
		? options.file.name.split(".").pop()
		: "";

	const safeExtension = extension ? `.${extension}` : "";
	const objectPath = `${options.pathPrefix}/${crypto.randomUUID()}${safeExtension}`;

	const { error: uploadError } = await supabase.storage
		.from(options.bucket)
		.upload(objectPath, options.file, {
			contentType: options.file.type || undefined,
			upsert: false,
		});

	if (uploadError) {
		throw new Error(uploadError.message);
	}

	const { data } = supabase.storage.from(options.bucket).getPublicUrl(objectPath);
	if (!data.publicUrl) {
		throw new Error("Não foi possível obter URL pública do arquivo.");
	}
	return data.publicUrl;
}


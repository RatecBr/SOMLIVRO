import { useId, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadPublicFile } from "@/lib/supabase/storage";

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_UPLOAD_BYTES = 300 * 1024 * 1024;
const MAX_IMAGE_UPLOAD_LABEL = "10 MB";
const MAX_AUDIO_UPLOAD_LABEL = "300 MB";

interface FileUploaderProps {
	onUploadComplete: (url: string) => void;
	onFileSelected?: (file: File) => void;
	accept?: string;
	label?: string;
}

export function FileUploader({
	onUploadComplete,
	onFileSelected,
	accept = "*",
	label = "Enviar arquivo",
}: FileUploaderProps) {
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState("");
	const [fileName, setFileName] = useState("");
	const inputId = useId();
	const lastSelectedKindRef = useRef<"image" | "audio">("audio");

	const isImageAccept = accept.includes("image/");

	const getMaxForFile = (file: File) => {
		const isImage = file.type.startsWith("image/") || isImageAccept;
		return {
			bytes: isImage ? MAX_IMAGE_UPLOAD_BYTES : MAX_AUDIO_UPLOAD_BYTES,
			label: isImage ? MAX_IMAGE_UPLOAD_LABEL : MAX_AUDIO_UPLOAD_LABEL,
			kind: isImage ? ("image" as const) : ("audio" as const),
		};
	};

	const getMaxForUi = () => {
		return isImageAccept ? MAX_IMAGE_UPLOAD_LABEL : MAX_AUDIO_UPLOAD_LABEL;
	};

	const uploadMutation = useMutation({
		mutationFn: async (file: File) => {
			setError("");
			setFileName(file.name);
			setUploadProgress(20);

			const isImage = file.type.startsWith("image/");
			const folder = isImage ? "covers" : "audio";

			const fileUrl = await uploadPublicFile({
				bucket: "media",
				pathPrefix: folder,
				file,
			});

			setUploadProgress(100);
			return fileUrl;
		},
		onSuccess: (fileUrl) => {
			onUploadComplete(fileUrl);
			setTimeout(() => {
				setUploadProgress(0);
				setFileName("");
			}, 2000);
		},
		onError: (err: Error) => {
			if (err.message.toLowerCase().includes("maximum allowed size")) {
				const label = lastSelectedKindRef.current === "image" ? MAX_IMAGE_UPLOAD_LABEL : MAX_AUDIO_UPLOAD_LABEL;
				setError(`Arquivo excede o tamanho máximo permitido (${label}).`);
			} else {
				setError(err.message);
			}
			setUploadProgress(0);
			setFileName("");
		},
	});

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setError("");
			if (uploadMutation.isPending) {
				setError("Aguarde o upload atual terminar.");
				e.target.value = "";
				return;
			}
			const max = getMaxForFile(file);
			lastSelectedKindRef.current = max.kind;
			if (file.size > max.bytes) {
				setError(`Arquivo excede o tamanho máximo permitido (${max.label}).`);
				e.target.value = "";
				return;
			}
			onFileSelected?.(file);
			uploadMutation.mutate(file);
		}
	};

	return (
		<div className="space-y-2">
			<input
				id={inputId}
				type="file"
				accept={accept}
				onChange={handleFileSelect}
				className="hidden"
			/>

			<Button
				asChild
				variant="outline"
				className="w-full h-11 sm:h-10 text-sm touch-manipulation"
			>
				<label htmlFor={inputId} className="cursor-pointer">
					<Upload className="w-4 h-4 mr-2" />
					{uploadMutation.isPending ? "Enviando..." : label}
				</label>
			</Button>

			<div className="text-xs text-gray-600">
				Máximo: {getMaxForUi()}
			</div>

			{uploadMutation.isPending && (
				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs sm:text-sm">
						<span className="text-gray-600 truncate max-w-[60%]">{fileName}</span>
						<span className="text-gray-600 flex-shrink-0">{uploadProgress}%</span>
					</div>
					<Progress value={uploadProgress} className="h-2" />
				</div>
			)}

			{uploadMutation.isSuccess && !uploadMutation.isPending && (
				<div className="flex items-center gap-2 text-sm text-green-600">
					<CheckCircle2 className="w-4 h-4 flex-shrink-0" />
					<span>Upload concluído!</span>
				</div>
			)}

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-sm">{error}</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

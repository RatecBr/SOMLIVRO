import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Link, Cloud, CheckCircle2, Info } from "lucide-react";

interface MediaInputProps {
	label: string;
	accept: string;
	value: string;
	onChange: (url: string) => void;
	onNameDetected?: (name: string) => void;
	uploadLabel?: string;
	linkPlaceholder?: string;
	required?: boolean;
	showPreview?: boolean;
	previewType?: "image" | "audio";
}

function convertCloudLinkToDirectUrl(url: string): string {
	if (!url) return url;

	// Google Drive: Convert sharing link to direct download link
	// Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
	// To: https://drive.google.com/uc?export=download&id=FILE_ID
	const googleDriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
	if (googleDriveMatch) {
		return `https://drive.google.com/uc?export=download&id=${googleDriveMatch[1]}`;
	}

	// Google Drive alternate format: https://drive.google.com/open?id=FILE_ID
	const googleDriveAltMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
	if (googleDriveAltMatch) {
		return `https://drive.google.com/uc?export=download&id=${googleDriveAltMatch[1]}`;
	}

	// Dropbox: Convert sharing link to direct download link
	// Format: https://www.dropbox.com/s/xxx/file.mp3?dl=0
	// To: https://www.dropbox.com/s/xxx/file.mp3?dl=1
	if (url.includes("dropbox.com")) {
		// Replace dl=0 with dl=1, or add dl=1 if not present
		if (url.includes("dl=0")) {
			return url.replace("dl=0", "dl=1");
		} else if (!url.includes("dl=1")) {
			return url + (url.includes("?") ? "&dl=1" : "?dl=1");
		}
	}

	// OneDrive: Convert sharing link to direct download
	// Format: https://1drv.ms/u/s!xxx or https://onedrive.live.com/...
	if (url.includes("1drv.ms") || url.includes("onedrive.live.com")) {
		// OneDrive embeds work with download=1
		if (!url.includes("download=1")) {
			return url + (url.includes("?") ? "&download=1" : "?download=1");
		}
	}

	return url;
}

function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

function fileNameToTitle(name: string): string {
	const base = name.trim().replace(/\.[a-z0-9]{1,8}$/i, "");
	return base.replace(/[_+]+/g, " ").replace(/-+/g, " ").replace(/\s+/g, " ").trim();
}

function getNameFromUrl(url: string): string {
	try {
		const parsed = new URL(url);
		const candidateParams = ["filename", "file", "name", "title"];
		for (const key of candidateParams) {
			const v = parsed.searchParams.get(key);
			if (v) return fileNameToTitle(decodeURIComponent(v));
		}

		const segments = parsed.pathname.split("/").filter(Boolean);
		const last = segments.at(-1);
		if (!last) return "";
		return fileNameToTitle(decodeURIComponent(last));
	} catch {
		return "";
	}
}

export function MediaInput({
	label,
	accept,
	value,
	onChange,
	onNameDetected,
	uploadLabel = "Upload File",
	linkPlaceholder = "https://drive.google.com/... or https://dropbox.com/...",
	required = false,
	showPreview = false,
	previewType = "audio",
}: MediaInputProps) {
	const [linkInput, setLinkInput] = useState("");
	const [linkError, setLinkError] = useState("");
	const [activeTab, setActiveTab] = useState<string>("upload");

	const handleLinkSubmit = () => {
		setLinkError("");

		if (!linkInput.trim()) {
			setLinkError("Please enter a URL");
			return;
		}

		if (!isValidUrl(linkInput)) {
			setLinkError("Please enter a valid URL");
			return;
		}

		const directUrl = convertCloudLinkToDirectUrl(linkInput.trim());
		onChange(directUrl);
		const suggested = getNameFromUrl(linkInput.trim()) || getNameFromUrl(directUrl);
		if (suggested) onNameDetected?.(suggested);
		setLinkInput("");
	};

	const handleLinkKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleLinkSubmit();
		}
	};

	return (
		<div className="space-y-2">
			<Label className="text-sm sm:text-base">
				{label} {required && "*"}
			</Label>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2 h-10 sm:h-9">
					<TabsTrigger value="upload" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm touch-manipulation">
						<Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						Upload
					</TabsTrigger>
					<TabsTrigger value="link" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm touch-manipulation">
						<Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						Cloud Link
					</TabsTrigger>
				</TabsList>

				<TabsContent value="upload" className="mt-3">
					<FileUploader
						accept={accept}
						onUploadComplete={onChange}
						onFileSelected={(file) => {
							const suggested = fileNameToTitle(file.name);
							if (suggested) onNameDetected?.(suggested);
						}}
						label={uploadLabel}
					/>
				</TabsContent>

				<TabsContent value="link" className="mt-3 space-y-3">
					<div className="flex flex-col sm:flex-row gap-2">
						<Input
							value={linkInput}
							onChange={(e) => setLinkInput(e.target.value)}
							onKeyDown={handleLinkKeyDown}
							placeholder={linkPlaceholder}
							className="flex-1 text-sm touch-manipulation"
						/>
						<button
							type="button"
							onClick={handleLinkSubmit}
							className="px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation text-sm font-medium"
						>
							Add Link
						</button>
					</div>

					{linkError && (
						<Alert variant="destructive">
							<AlertDescription className="text-sm">{linkError}</AlertDescription>
						</Alert>
					)}

					<div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
						<div className="flex items-start gap-2">
							<Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
							<div className="text-xs sm:text-sm text-blue-700">
								<p className="font-medium mb-1">Supported cloud services:</p>
								<ul className="list-disc list-inside space-y-0.5 text-blue-600">
									<li><strong>Google Drive</strong> - Share link</li>
									<li><strong>Dropbox</strong> - Copy link</li>
									<li><strong>OneDrive</strong> - Share link</li>
									<li><strong>Direct URL</strong> - Any URL</li>
								</ul>
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			{value && (
				<div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
					<div className="flex items-center gap-2 text-sm text-green-700">
						<CheckCircle2 className="w-4 h-4 flex-shrink-0" />
						<span className="font-medium">Media ready</span>
					</div>
					{showPreview && previewType === "image" && (
						<img
							src={value}
							alt="Preview"
							className="mt-2 w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
						/>
					)}
					{showPreview && previewType === "audio" && (
						<audio controls className="mt-2 w-full" src={value}>
							Your browser does not support the audio element.
						</audio>
					)}
					<p className="mt-1 text-xs text-green-600 truncate" title={value}>
						{value.length > 40 ? value.substring(0, 40) + "..." : value}
					</p>
				</div>
			)}
		</div>
	);
}

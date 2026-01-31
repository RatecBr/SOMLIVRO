import { createFileRoute } from "@tanstack/react-router";
import { AudiobookPlatform } from "@/components/AudiobookPlatform";

export const Route = createFileRoute("/biblioteca")({
	component: Biblioteca,
});

function Biblioteca() {
	return <AudiobookPlatform />;
}


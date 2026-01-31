import { createFileRoute } from "@tanstack/react-router";
import { AudiobookPlatform } from "@/components/AudiobookPlatform";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return <AudiobookPlatform />;
}

import { createFileRoute } from "@tanstack/react-router";
import { AudiobookPlatform } from "@/components/AudiobookPlatform";

export const Route = createFileRoute("/admin")({
	component: Admin,
});

function Admin() {
	return <AudiobookPlatform initialAdminMode />;
}


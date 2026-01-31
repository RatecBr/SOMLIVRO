import { createFileRoute } from "@tanstack/react-router";
import { UserLogin } from "@/components/UserLogin";

export const Route = createFileRoute("/entrar")({
	component: Entrar,
});

function Entrar() {
	return <UserLogin />;
}


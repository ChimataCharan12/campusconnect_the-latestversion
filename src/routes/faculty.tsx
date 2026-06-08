import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/faculty")({
  component: () => <AppShell role="faculty" />,
});

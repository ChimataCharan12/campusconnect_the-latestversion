import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, HeadContent, Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import appCss from "../styles.css?url";
import appLogo from "@/assets/app-logo.png.asset.json";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <Link to="/" className="inline-block mt-6 px-5 py-2.5 rounded-lg gradient-primary text-white font-medium">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComp({ error }: { error: Error }) {
  return <div className="p-8"><h1 className="text-xl font-bold">Error</h1><pre className="text-sm mt-2">{error.message}</pre></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Campus Connect — Smart Campus, Connected Community" },
      { name: "description", content: "Campus Connect is a modern College Management ERP for Students, Faculty, and Parents." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: appLogo.url },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComp,
  notFoundComponent: NotFound,
  errorComponent: ErrorComp,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>
  );
}

function RootComp() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

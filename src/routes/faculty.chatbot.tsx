import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, BarChart3, FileText, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PremiumChatbot } from "@/components/PremiumChatbot";

export const Route = createFileRoute("/faculty/chatbot")({ component: Page });

function Page() {
  const { user } = useAuth();
  const first = user?.name?.split(" ")[1] ?? user?.name?.split(" ")[0] ?? "there";
  return (
    <PremiumChatbot
      title="Faculty AI Assistant"
      subtitle="Manage classes, students, marks and reports with AI"
      placeholder="Ask about your classes, students, attendance…"
      welcome={`Hi Dr. ${first}! I'm your AI teaching assistant. Ask me about your classes, students, attendance, marks, or anything else — I'm here to help.`}
      prompts={[
        { icon: ClipboardList, label: "How do I mark attendance?" },
        { icon: FileText, label: "Show pending marks uploads" },
        { icon: BarChart3, label: "Summarize my class performance" },
        { icon: Users, label: "List students with low attendance" },
      ]}
      reply={(t) => {
        const q = t.toLowerCase();
        if (q.includes("attendance")) return "Open Attendance → pick class & date → tick present → Save. You can also bulk-mark using Upload from the toolbar.";
        if (q.includes("marks")) return "You have pending mark uploads for CSE-A (Mid-2) and CSE-B (Mid-1). Go to Marks → Upload.";
        if (q.includes("class") || q.includes("performance")) return "Class average is 76%. Top performer: Ananya Sharma (94%). 4 students need attention (below 60%).";
        if (q.includes("low") || q.includes("student")) return "Low attendance (<75%): Rahul K (62%), Priya M (66%), Aditya S (71%), Megha R (74%).";
        return "Got it. Here's a summary of what I found — open the related module to see full details.";
      }}
    />
  );
}

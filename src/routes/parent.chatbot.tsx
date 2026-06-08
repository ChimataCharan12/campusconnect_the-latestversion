import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, GraduationCap, DollarSign, Bell } from "lucide-react";
import { PremiumChatbot } from "@/components/PremiumChatbot";

export const Route = createFileRoute("/parent/chatbot")({ component: Page });

function Page() {
  return (
    <PremiumChatbot
      title="Parent AI Assistant"
      subtitle="Ask about your child's attendance, marks, fees and more"
      placeholder="Ask about your child's progress…"
      welcome="Hello! I'm your Parent AI Assistant. I can help you with your child's attendance, marks, fees, notifications and academic progress. How can I help today?"
      prompts={[
        { icon: CalendarCheck, label: "Attendance summary" },
        { icon: GraduationCap, label: "Latest marks" },
        { icon: DollarSign, label: "Fee status" },
        { icon: Bell, label: "Recent notifications" },
      ]}
      reply={(t) => {
        const q = t.toLowerCase();
        if (q.includes("attendance")) return "Ananya's attendance for May 2025 is 82% (Good). She has attended 98 of 120 classes. Low subjects: Computer Networks (48%), Discrete Mathematics (65%).";
        if (q.includes("marks") || q.includes("grade")) return "Latest semester GPA: 8.6. CGPA: 8.24. Class rank: 5/60. Top subject: Operating Systems (94/100).";
        if (q.includes("fee")) return "Semester fee fully paid (₹62,500). Next dues: 1 Jul 2025 — ₹65,000 (Sem 7).";
        if (q.includes("notif")) return "3 recent notifications: Parent-Teacher meet on 5 Jun, Fee reminder for Sem 7, Mid-2 exam schedule released.";
        return "Here's a summary of what I found about your child's progress. Open the related module for full details.";
      }}
    />
  );
}

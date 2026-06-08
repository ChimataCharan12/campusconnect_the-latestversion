import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, GraduationCap, Calendar, ClipboardList, DollarSign, BookOpen } from "lucide-react";
import { PremiumChatbot } from "@/components/PremiumChatbot";

export const Route = createFileRoute("/student/chatbot")({ component: Page });

function Page() {
  return (
    <PremiumChatbot
      title="Academic Assistant"
      subtitle="Ask me anything about your campus, classes and academics"
      placeholder="Ask about attendance, marks, timetable…"
      welcome="Hi Ananya! I'm your Academic Assistant. I can help you with attendance, marks, timetable, assignments, fees and campus information. How can I help you today?"
      prompts={[
        { icon: CalendarCheck, label: "My attendance" },
        { icon: GraduationCap, label: "Show my marks" },
        { icon: Calendar, label: "Today's timetable" },
        { icon: ClipboardList, label: "Pending assignments" },
        { icon: DollarSign, label: "Pay fee" },
        { icon: BookOpen, label: "Library hours" },
      ]}
    />
  );
}

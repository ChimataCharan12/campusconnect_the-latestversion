export const subjects = [
  { code: "CS204", name: "Data Structures", attendance: 90, status: "Excellent", color: "violet" },
  { code: "CS205", name: "Database Management", attendance: 78, status: "Good", color: "blue" },
  { code: "MA201", name: "Discrete Mathematics", attendance: 65, status: "Average", color: "amber" },
  { code: "CS206", name: "Computer Networks", attendance: 48, status: "Low", color: "rose" },
  { code: "CS207", name: "Operating Systems", attendance: 72, status: "Good", color: "emerald" },
  { code: "CS208", name: "Software Engineering", attendance: 85, status: "Good", color: "fuchsia" },
];

export const marks = [
  { code: "CS304", name: "Data Structures", internal: 36, external: 56, total: 92, grade: "A+", remark: "Excellent" },
  { code: "CS305", name: "Database Management", internal: 31, external: 46, total: 77, grade: "B+", remark: "Good" },
  { code: "CS306", name: "Computer Networks", internal: 30, external: 48, total: 78, grade: "B+", remark: "Good" },
  { code: "MA201", name: "Discrete Mathematics", internal: 24, external: 38, total: 62, grade: "C", remark: "Average" },
  { code: "CS307", name: "Operating Systems", internal: 28, external: 42, total: 70, grade: "B", remark: "Good" },
  { code: "CS308", name: "Software Engineering", internal: 32, external: 50, total: 82, grade: "A", remark: "Very Good" },
];

export const todaysClasses = [
  { time: "09:00 - 10:00", subject: "Data Structures", room: "B-201", faculty: "Dr. R. Verma", live: true },
  { time: "10:15 - 11:15", subject: "Database Management Systems", room: "B-202", faculty: "Dr. P. Sharma" },
  { time: "11:30 - 12:30", subject: "Computer Networks", room: "B-203", faculty: "Dr. N. Patel" },
  { time: "02:00 - 03:00", subject: "OS Lab", room: "Lab-B1", faculty: "Dr. A. Singh" },
];

export const announcements = [
  { title: "Internal Exams Schedule Released", date: "10 May 2025", type: "exam" },
  { title: "Tech Fest 2K25 Registration Open", date: "09 May 2025", type: "event" },
  { title: "Library Book Issue Update", date: "08 May 2025", type: "library" },
  { title: "Campus placement drive on 25th May", date: "06 May 2025", type: "placement" },
];

export const assignments = [
  { title: "DBMS Normalization Exercise", subject: "Database Management", due: "20 May 2025", status: "Pending", priority: "high" },
  { title: "Binary Tree Implementation", subject: "Data Structures", due: "22 May 2025", status: "In Progress", priority: "medium" },
  { title: "Network Topology Report", subject: "Computer Networks", due: "25 May 2025", status: "Pending", priority: "high" },
  { title: "OS Process Scheduling", subject: "Operating Systems", due: "28 May 2025", status: "Submitted", priority: "low" },
];

export const materials = [
  { title: "DSA Complete Notes", subject: "Data Structures", type: "PDF", size: "4.2 MB", downloads: 234 },
  { title: "DBMS Lecture Slides", subject: "Database Management", type: "PPT", size: "8.1 MB", downloads: 189 },
  { title: "Previous Year Papers 2024", subject: "All Subjects", type: "PDF", size: "12 MB", downloads: 512 },
  { title: "OS Concepts Chapter 5", subject: "Operating Systems", type: "PDF", size: "2.8 MB", downloads: 145 },
  { title: "Networks Lab Manual", subject: "Computer Networks", type: "PDF", size: "5.6 MB", downloads: 98 },
  { title: "Software Engineering Notes", subject: "Software Engineering", type: "PDF", size: "3.4 MB", downloads: 167 },
];

export const notifications = [
  { title: "Internal marks for Data Structures published", time: "2 hours ago", category: "Marks", read: false },
  { title: "Attendance updated for this week", time: "1 day ago", category: "Attendance", read: false },
  { title: "Campus placement drive on 25th May. Register now!", time: "2 days ago", category: "Events", read: true },
  { title: "DBMS Assignment 2 graded", time: "3 days ago", category: "Assignments", read: true },
  { title: "Library: New books added", time: "5 days ago", category: "Academic", read: true },
];

export const events = [
  { title: "Tech Fest 2K25", date: "12 May 2025", category: "Cultural" },
  { title: "Internal Exams", date: "20 May 2025", category: "Exam" },
  { title: "Placement Drive", date: "25 May 2025", category: "Placement" },
  { title: "AI Seminar", date: "30 May 2025", category: "Workshop" },
];

export const portals = [
  { name: "MVSR College Official Website", desc: "Official college website for announcements, academics and campus information.", category: "Official", color: "violet", url: "https://mvsrec.edu.in/" },
  { name: "MVSR Attendance Portal", desc: "Official attendance management portal.", category: "Attendance", color: "emerald", url: "https://mvsr.winnou.net/" },
  { name: "MVSR Results Portal", desc: "Official results and academic performance portal.", category: "Results", color: "amber", url: "https://matrusri.skolo.in/#/pages/auth/login" },
  { name: "Eduskills Portal", desc: "Internships, skill development and certification programs.", category: "Skills", color: "blue", url: "https://eduskillsfoundation.org/login/" },
  { name: "AICTE Internship Portal", desc: "AICTE internships, opportunities and industry programs.", category: "Internships", color: "orange", url: "https://internship.aicte-india.org/login_new.php" },
  { name: "Student Opinion Poll (SOP) Portal", desc: "Official student feedback and opinion portal.", category: "Feedback", color: "rose", url: "https://data.mvsrec.edu.in/sop/login2.php" },
  { name: "MVSR Official Instagram", desc: "Official college social media updates.", category: "Social", color: "fuchsia", url: "https://www.instagram.com/mvsrconnect/" },
  { name: "MVSR LinkedIn Page", desc: "Official professional networking page.", category: "Social", color: "sky", url: "https://www.linkedin.com/company/mvsrec/" },
];

export const attendanceTrend = [
  { week: "W1", value: 78 },
  { week: "W2", value: 82 },
  { week: "W3", value: 75 },
  { week: "W4", value: 88 },
  { week: "W5", value: 84 },
  { week: "W6", value: 86 },
];

export const performanceTrend = [
  { month: "Nov", value: 70 },
  { month: "Dec", value: 72 },
  { month: "Jan", value: 75 },
  { month: "Feb", value: 73 },
  { month: "Mar", value: 78 },
  { month: "Apr", value: 76 },
  { month: "May", value: 78 },
];

export const gradeDistribution = [
  { name: "Excellent (80%+)", value: 3, color: "oklch(0.65 0.16 150)" },
  { name: "Good (60-79%)", value: 2, color: "oklch(0.65 0.15 240)" },
  { name: "Average (40-59%)", value: 1, color: "oklch(0.75 0.16 65)" },
  { name: "Below 40%", value: 0, color: "oklch(0.62 0.22 25)" },
];

const firstNames = ["Ananya","Rohan","Priya","Karthik","Sneha","Arjun","Neha","Aditya","Meghana","Vikram","Riya","Aman","Shreya","Kabir","Ishita","Dev","Anjali","Yash","Pooja","Nikhil","Tanvi","Harsh","Diya","Manav","Sara","Veer","Kavya","Aarav","Mira","Rahul","Simran","Aryan","Tara","Ritvik","Aditi","Siddharth","Mahi","Parth","Anika","Reyansh","Avni","Krish","Vanya","Ayaan","Anvi","Dhruv","Ira","Vivaan","Saanvi","Atharv","Myra","Ishaan","Aadhya","Reyaan","Pari","Shaurya","Riya","Advait","Navya","Kiaan"];
const lastNames = ["Sharma","Verma","Nair","Reddy","Iyer","Mehta","Singh","Patil","Rao","Das","Kapoor","Joshi","Chopra","Bansal","Khanna","Saxena","Gupta","Malhotra","Pillai","Bose"];
function mkStudents() {
  return Array.from({ length: 60 }).map((_, i) => {
    const att = 60 + ((i * 7) % 40);
    const cgpa = +(6 + ((i * 13) % 35) / 10).toFixed(2);
    return {
      roll: `23CSE${String(i + 1).padStart(3, "0")}`,
      name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      branch: "CSE",
      section: i % 5 === 0 ? "B" : "A",
      attendance: att,
      cgpa: Math.min(9.8, cgpa),
    };
  });
}
export const students = mkStudents();

export const facultyList = [
  { name: "Dr. R. Verma", dept: "CSE", subject: "Data Structures", email: "rverma@campus.edu", phone: "+91 98765 11111" },
  { name: "Dr. P. Sharma", dept: "CSE", subject: "DBMS", email: "psharma@campus.edu", phone: "+91 98765 22222" },
  { name: "Dr. N. Patel", dept: "CSE", subject: "Networks", email: "npatel@campus.edu", phone: "+91 98765 33333" },
  { name: "Dr. A. Singh", dept: "CSE", subject: "Operating Systems", email: "asingh@campus.edu", phone: "+91 98765 44444" },
];

export const feeHistory = [
  { receipt: "RCP2025001", date: "10 Jan 2025", amount: 45000, status: "Paid" },
  { receipt: "RCP2024089", date: "12 Aug 2024", amount: 45000, status: "Paid" },
  { receipt: "RCP2024054", date: "15 Jan 2024", amount: 42000, status: "Paid" },
  { receipt: "—", date: "Due 15 Jul 2025", amount: 22500, status: "Pending" },
];

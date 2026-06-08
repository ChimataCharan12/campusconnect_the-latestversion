import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middlewares/error.js";

// Route imports
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import facultyRoutes from "./routes/faculty.js";
import parentRoutes from "./routes/parents.js";
import adminRoutes from "./routes/admin.js";
import timetableRoutes from "./routes/timetable.js";
import attendanceRoutes from "./routes/attendance.js";
import marksRoutes from "./routes/marks.js";
import notificationRoutes from "./routes/notifications.js";
import leaveRoutes from "./routes/leaves.js";
import feeRoutes from "./routes/fees.js";

dotenv.config();

const app = express();

// Core middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health / root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Campus Connect REST API", version: "2.0.0" });
});

// ── API Route mounts ────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);         // Auth: login, register, me
app.use("/api/students", studentRoutes);  // Student profiles
app.use("/api/faculty", facultyRoutes);   // Faculty profiles
app.use("/api/parents", parentRoutes);    // Parent profiles
app.use("/api/admin", adminRoutes);       // Admin dashboard + user management
app.use("/api/timetable", timetableRoutes); // Timetable slots
app.use("/api/attendance", attendanceRoutes); // Attendance tracking
app.use("/api/marks", marksRoutes);         // Student performance/grades
app.use("/api/notifications", notificationRoutes); // System announcements
app.use("/api/leaves", leaveRoutes);       // Leave requests
app.use("/api/fees", feeRoutes);           // Fee invoices and payments

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;

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

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;

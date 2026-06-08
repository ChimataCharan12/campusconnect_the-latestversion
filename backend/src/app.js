import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middlewares/error.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Campus Connect REST API" });
});

// Route mounts
app.use("/api/auth", authRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;

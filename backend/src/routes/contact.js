import express from "express";
import { submitContactMessage } from "../controllers/contactController.js";

const router = express.Router();

// POST /api/contact-admin
router.post("/", submitContactMessage);

export default router;

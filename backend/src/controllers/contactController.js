import ContactMessage from "../models/ContactMessage.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @desc    Submit a contact message to admin
// @route   POST /api/contact-admin
// @access  Public
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return sendError(res, "Please fill in all fields: name, email, and message.", 400);
    }

    await ContactMessage.create({ name, email, message });

    return sendSuccess(res, "Message sent successfully. The admin will get back to you soon.");
  } catch (error) {
    next(error);
  }
};

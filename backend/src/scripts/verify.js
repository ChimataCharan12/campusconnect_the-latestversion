import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import TimetableSlot from "../models/TimetableSlot.js";
import Mark from "../models/Mark.js";
import Invoice from "../models/Invoice.js";
import Notification from "../models/Notification.js";

dotenv.config();

const runVerify = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    const totalAttendance = await Attendance.countDocuments({});
    const totalStudents = await Student.countDocuments({});
    const totalSlots = await TimetableSlot.countDocuments({});
    const totalMarks = await Mark.countDocuments({});
    const totalInvoices = await Invoice.countDocuments({});
    const totalNotifications = await Notification.countDocuments({});

    console.log("\n--- COLLECTION COUNTS ---");
    console.log(`Attendances:   ${totalAttendance}`);
    console.log(`Students:      ${totalStudents}`);
    console.log(`TimetableSlots: ${totalSlots}`);
    console.log(`Marks:         ${totalMarks}`);
    console.log(`Invoices:      ${totalInvoices}`);
    console.log(`Notifications: ${totalNotifications}`);
    console.log("-------------------------\n");

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Verification error:", err);
    process.exit(1);
  }
};

runVerify();

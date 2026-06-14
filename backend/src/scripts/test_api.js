import connectDB from "../config/db.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  return res.json();
};

const runTest = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for student lookup.");

    // Find an IT, Year 3, Section A student
    const itStudent = await Student.findOne({ branch: "IT", section: "A", year: 3 }).populate("userId");
    if (!itStudent) {
      throw new Error("No IT 3Y A student found.");
    }
    const studentUsername = itStudent.userId.username;
    console.log(`Found IT Student: ${itStudent.userId.name} (${studentUsername})`);
    
    // Close mongoose so it doesn't block
    await mongoose.connection.close();

    // 1. Log in as IT Student
    console.log(`\nLogging in as IT Student ${studentUsername}...`);
    const loginStudent = await fetchJson(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: studentUsername, password: "Welcome@2026" })
    });
    
    if (!loginStudent.success) {
      throw new Error("Student login failed: " + loginStudent.message);
    }
    const studentToken = loginStudent.data.token;
    console.log("Student logged in successfully.");

    // Get Student Profile to find Student Profile ID
    const studentProfile = await fetchJson(`${BASE_URL}/api/students/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const studentId = studentProfile.data.profile._id;

    // Call Student Attendance Summary API
    const studentSummary = await fetchJson(`${BASE_URL}/api/attendance/summary/${studentId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log("\n--- IT Student Attendance Summary API Output ---");
    console.log(JSON.stringify(studentSummary, null, 2));

    // Call Student Attendance Logs API
    const studentLogs = await fetchJson(`${BASE_URL}/api/attendance/student/${studentId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log("\n--- IT Student Attendance Logs API Output ---");
    console.log(JSON.stringify(studentLogs, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
};

runTest();

import mongoose from "mongoose";
import dotenv from "dotenv";
import XLSX from "xlsx";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Parent from "../models/Parent.js";
import Attendance from "../models/Attendance.js";
import TimetableSlot from "../models/TimetableSlot.js";
import Mark from "../models/Mark.js";
import Invoice from "../models/Invoice.js";
import Notification from "../models/Notification.js";
import LeaveRequest from "../models/LeaveRequest.js";

// Load environment variables
dotenv.config();

const romanToInteger = (roman) => {
  if (!roman) return null;
  const romanMap = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8
  };
  return romanMap[String(roman).trim().toUpperCase()] || null;
};

const cleanString = (val) => {
  if (typeof val === 'string') {
    return val.trim();
  }
  return val;
};

const runSeeder = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    console.log("Database connection successful. Starting seeder...");

    // 2. Load Excel files
    console.log("Loading Excel files...");
    const basePath = "D:/data student,faculty,subjects";
    
    const studentsFile = XLSX.readFile(`${basePath}/students.xlsx`);
    const studentsSheet = studentsFile.Sheets['3RD YEAR-SEM-V'];
    const rawStudents = XLSX.utils.sheet_to_json(studentsSheet, { defval: null });

    const facultyFile = XLSX.readFile(`${basePath}/faculty.xlsx`);
    const facultySheet = facultyFile.Sheets['Sheet1'];
    const rawFaculty = XLSX.utils.sheet_to_json(facultySheet, { defval: null });

    const subjectsFile = XLSX.readFile(`${basePath}/subjects.xlsx`);
    const subjectsSheet = subjectsFile.Sheets['Sheet1'];
    const rawSubjects = XLSX.utils.sheet_to_json(subjectsSheet, { defval: null });

    const mappingFile = XLSX.readFile(`${basePath}/faculty_subject_mapping.xlsx`);
    const mappingSheet = mappingFile.Sheets['Sheet1'];
    const rawMappings = XLSX.utils.sheet_to_json(mappingSheet, { defval: null });

    console.log("Excel files loaded. Cleaning datasets...");

    // 3. Clean datasets
    // Students: filter out rows with duplicate headers or empty Roll No.
    const studentsClean = rawStudents
      .map(row => {
        const cleaned = {};
        for (const key in row) {
          cleaned[key.trim()] = cleanString(row[key]);
        }
        return cleaned;
      })
      .filter(row => row['Roll No.'] && row['Roll No.'] !== 'Roll No.');

    // Faculty: filter out rows with empty Email
    const facultyClean = rawFaculty
      .map(row => {
        const cleaned = {};
        for (const key in row) {
          cleaned[key.trim()] = cleanString(row[key]);
        }
        return cleaned;
      })
      .filter(row => row['Email'] && row['Email'] !== 'Email');

    // Subjects: filter out duplicate headers, empty codes, and skip internship rows
    const subjectsClean = rawSubjects
      .map(row => {
        const cleaned = {};
        for (const key in row) {
          cleaned[key.trim()] = cleanString(row[key]);
        }
        return cleaned;
      })
      .filter(row => {
        const code = row['subjectCode'];
        const name = row['subjectName'];
        if (!code || code === 'subjectCode') return false;
        // Skip internship rows that have no valid code (or if name mentions internship)
        if (name && name.toLowerCase().includes('internship') && code === null) return false;
        return true;
      });

    // Mappings: filter out rows with empty Email
    const mappingsClean = rawMappings
      .map(row => {
        const cleaned = {};
        for (const key in row) {
          cleaned[key.trim()] = cleanString(row[key]);
        }
        return cleaned;
      })
      .filter(row => row['facultyEmail'] && row['facultyEmail'] !== 'facultyEmail');

    console.log(`Cleaned Data counts:
- Students: ${studentsClean.length}
- Faculty: ${facultyClean.length}
- Subjects: ${subjectsClean.length}
- Mappings: ${mappingsClean.length}`);

    // Build subjectCode -> subjectName lookup
    const subjectLookup = {};
    subjectsClean.forEach(sub => {
      subjectLookup[sub.subjectCode] = sub.subjectName;
    });

    // 4. Purge existing data
    console.log("Purging existing users, students, faculties, parents, timetable slots, marks, invoices, notifications, leaves, and attendance...");
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Parent.deleteMany({});
    await TimetableSlot.deleteMany({});
    await Attendance.deleteMany({});
    await Mark.deleteMany({});
    await Invoice.deleteMany({});
    await Notification.deleteMany({});
    await LeaveRequest.deleteMany({});
    console.log("Existing data purged successfully.");

    // 5. Seed Admin User
    console.log("Seeding default Administrator...");
    const adminUser = await User.create({
      username: "admin",
      email: "admin@mvsrec.edu.in",
      passwordHash: "Welcome@2026", // Pre-save hook will hash this
      role: "admin",
      name: "System Administrator",
      subtitle: "Administrator"
    });
    console.log(`Admin user seeded: ${adminUser.username}`);

    // 6. Seed Faculty Users & Profiles
    console.log("Seeding Faculty...");
    const facultyEmployeeIdMap = {};

    for (let i = 0; i < facultyClean.length; i++) {
      const row = facultyClean[i];
      const email = row['Email'];
      const username = email.split('@')[0];
      const employeeId = `FAC${String(i + 1).padStart(3, '0')}`;

      // Find subjects mapped to this faculty email
      const facultyMappings = mappingsClean.filter(m => m.facultyEmail.toLowerCase() === email.toLowerCase());
      const facultySubjects = [...new Set(facultyMappings.map(m => subjectLookup[m.subjectCode]).filter(Boolean))];

      const facultyUser = await User.create({
        username,
        email,
        passwordHash: "Welcome@2026",
        role: "faculty",
        name: row['Facultyname'],
        subtitle: row['Designation'] || "Faculty"
      });

      await Faculty.create({
        userId: facultyUser._id,
        employeeId,
        department: row['Department'],
        designation: row['Designation'] || "Assistant Professor",
        subjects: facultySubjects,
        isActive: true
      });

      facultyEmployeeIdMap[row['Facultyname']] = employeeId;
    }
    console.log(`Successfully seeded ${facultyClean.length} Faculty accounts.`);

    // 7. Seed Parents and Students (and link them)
    console.log("Seeding Students and Parents...");
    let studentCount = 0;
    let parentCount = 0;

    for (let i = 0; i < studentsClean.length; i++) {
      const row = studentsClean[i];
      const rollNumber = row['Roll No.'];
      const studentUsername = rollNumber.replace(/-/g, '').trim();
      const studentEmail = `${studentUsername}@mvsrec.edu.in`;
      
      const fatherName = row["Father's Name"] || "Father";
      const parentUsername = `parent_${studentUsername}`;
      const parentEmail = `parent.${studentUsername}@mvsrec.edu.in`;
      
      // Deterministic 10-digit phone number: '9' + last 8 digits of roll number padded
      const parentPhone = '9' + studentUsername.slice(-9).padStart(9, '0');

      // Create Parent User and Profile
      const parentUser = await User.create({
        username: parentUsername,
        email: parentEmail,
        passwordHash: "Welcome@2026",
        role: "parent",
        name: fatherName,
        subtitle: "Parent"
      });

      const parentProfile = await Parent.create({
        userId: parentUser._id,
        phone: parentPhone,
        relation: "Father",
        children: [],
        isActive: true
      });
      parentCount++;

      // Create Student User and Profile
      const studentUser = await User.create({
        username: studentUsername,
        email: studentEmail,
        passwordHash: "Welcome@2026",
        role: "student",
        name: row['Name of the Student'],
        subtitle: `Student - ${row['BRANCH']}`
      });

      const semStr = row['VI']; // Row has 'VI' for Semester
      const semesterVal = romanToInteger(semStr) || 6;

      const studentProfile = await Student.create({
        userId: studentUser._id,
        rollNumber,
        branch: row['BRANCH'],
        section: row['SECTION'],
        year: parseInt(row['YEAR']) || 3,
        semester: semesterVal,
        cgpa: 0,
        parentId: parentProfile._id,
        gender: row['GENDER'] || "",
        isActive: true
      });
      studentCount++;

      // Update Parent Profile with Child Link
      await Parent.findByIdAndUpdate(parentProfile._id, {
        $push: { children: studentProfile._id }
      });
    }

    console.log(`Successfully seeded ${studentCount} Students and ${parentCount} Parents.`);

    // 7.5 Seed Timetable Slots
    console.log("Seeding Timetable Slots...");
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const hours = [
      { start: "09:00", end: "09:50" },
      { start: "09:50", end: "10:40" },
      { start: "11:00", end: "11:50" },
      { start: "11:50", end: "12:40" },
      { start: "13:40", end: "14:30" },
      { start: "14:30", end: "15:20" }
    ];

    const classSlots = {}; // branch-year-section -> count of assigned slots

    for (const mapping of mappingsClean) {
      const email = mapping.facultyEmail.toLowerCase();
      const facultyUser = await User.findOne({ email });
      if (!facultyUser) continue;
      const faculty = await Faculty.findOne({ userId: facultyUser._id });
      if (!faculty) continue;

      const subjectName = subjectLookup[mapping.subjectCode] || "Subject";
      const branch = mapping.branch;
      const section = mapping.section;
      const year = parseInt(mapping.year) || 3;
      const semesterVal = romanToInteger(mapping.semester) || 6;

      const classKey = `${branch}-${year}-${section}`;
      if (classSlots[classKey] === undefined) {
        classSlots[classKey] = 0;
      }

      // Assign 2 periods weekly for this subject mapping
      for (let repeat = 0; repeat < 2; repeat++) {
        const slotIdx = classSlots[classKey];
        const day = days[Math.floor(slotIdx / 6) % 5];
        const hourIdx = slotIdx % 6;
        const timeSlot = hours[hourIdx];

        const room = `${branch}-${year}0${section.charCodeAt(0) - 64}`;

        await TimetableSlot.create({
          subject: subjectName,
          code: mapping.subjectCode,
          facultyId: faculty._id,
          day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          room,
          branch,
          section,
          year,
          semester: semesterVal
        });

        classSlots[classKey]++;
      }
    }
    console.log(`Seeded Timetable slots: ${await TimetableSlot.countDocuments()} slots.`);

    // 8. Seed Attendance Data
    console.log("Seeding attendance data (60 school days)...");

    // Gather all students
    const allStudents = await Student.find({ isActive: true });
    // Find the admin user for fallback markedBy
    const adminUserDoc = await User.findOne({ role: "admin" });

    // OPTIMIZATION: Fetch all timetable slots and faculties into memory to avoid loops DB queries
    console.log("Fetching all timetable slots and faculties in memory for seeding...");
    const allSlots = await TimetableSlot.find({});
    const allFaculties = await Faculty.find({});
    console.log(`Loaded ${allSlots.length} timetable slots and ${allFaculties.length} faculties.`);

    const today = new Date();
    const attendanceOps = [];
    const statuses = ["Present", "Present", "Present", "Present", "Present", "Present", "Absent", "Late"];

    // Generate 60 school days back from today (skip weekends) - Normalized to UTC midnight
    const schoolDays = [];
    let d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    while (schoolDays.length < 60) {
      const dayOfWeek = d.getUTCDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        schoolDays.push(new Date(d));
      }
      d.setUTCDate(d.getUTCDate() - 1);
    }

    const marksToCreate = [];
    const invoicesToCreate = [];

    // For each student, find their branch subjects from in-memory slots
    for (const student of allStudents) {
      const studentSlots = allSlots.filter(s => 
        s.branch === student.branch &&
        s.section === student.section &&
        s.year === student.year &&
        s.semester === student.semester
      );

      // Get unique subjects taught in this class section
      const studentSubjects = [...new Set(studentSlots.map(s => s.subject))];

      if (studentSubjects.length > 0) {
        const seed = parseInt(student.rollNumber.replace(/\D/g, "").slice(-4)) || 1;

        for (const subjectName of studentSubjects) {
          const slot = studentSlots.find(s => s.subject === subjectName);
          let markedByUserId = adminUserDoc._id;
          if (slot) {
            const slotFaculty = allFaculties.find(f => f._id.toString() === slot.facultyId.toString());
            if (slotFaculty) {
              markedByUserId = slotFaculty.userId;
            }
          }

          // Attendance seeding disabled per Option B requirements

          // Seeding marks (Internal 1, Internal 2, Assignment, Semester)
          const i1 = 14 + Math.floor(Math.random() * 7); // max 20, min 14
          const i2 = 13 + Math.floor(Math.random() * 8); // max 20, min 13
          const ass = 8 + Math.floor(Math.random() * 3); // max 10, min 8
          const sem = 38 + Math.floor(Math.random() * 23); // max 60, min 38

          marksToCreate.push(
            { studentId: student._id, subject: subjectName, examType: "Internal 1", marksObtained: i1, maxMarks: 20, remarks: "Good performance" },
            { studentId: student._id, subject: subjectName, examType: "Internal 2", marksObtained: i2, maxMarks: 20, remarks: "Consistent" },
            { studentId: student._id, subject: subjectName, examType: "Assignment", marksObtained: ass, maxMarks: 10, remarks: "Timely submission" },
            { studentId: student._id, subject: subjectName, examType: "Semester", marksObtained: sem, maxMarks: 60, remarks: "Passed" }
          );
        }
      }

      // Create invoices
      invoicesToCreate.push(
        {
          studentId: student._id,
          title: "Tuition Fee - Semester 6",
          amount: 45000,
          dueDate: new Date(today.getTime() - 150 * 24 * 60 * 60 * 1000),
          status: "Paid",
          paymentDate: new Date(today.getTime() - 145 * 24 * 60 * 60 * 1000),
          paymentMethod: "Net Banking",
          transactionId: "TXN" + Math.floor(Math.random() * 900000000 + 100000000)
        },
        {
          studentId: student._id,
          title: "Library Fee - Semester 6",
          amount: 1500,
          dueDate: new Date(today.getTime() - 150 * 24 * 60 * 60 * 1000),
          status: "Paid",
          paymentDate: new Date(today.getTime() - 142 * 24 * 60 * 60 * 1000),
          paymentMethod: "UPI",
          transactionId: "TXN" + Math.floor(Math.random() * 900000000 + 100000000)
        },
        {
          studentId: student._id,
          title: "Transport Fee - Semester 6",
          amount: 8500,
          dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
          status: "Unpaid"
        }
      );
    }

    console.log("Attendance seeding disabled, skipping database write.");

    if (marksToCreate.length > 0) {
      await Mark.insertMany(marksToCreate);
      console.log(`Seeded ${marksToCreate.length} student marks.`);
    }
    if (invoicesToCreate.length > 0) {
      await Invoice.insertMany(invoicesToCreate);
      console.log(`Seeded ${invoicesToCreate.length} student fee invoices.`);
    }

    // 8.2 Seed Announcements/Notifications
    console.log("Seeding announcements/notifications...");
    const announcementsToCreate = [
      {
        title: "Internal Exams Schedule Released",
        message: "The schedule for Internal Exams 2 has been released. Please check the timetable page for details.",
        recipientRoles: ["student", "parent"],
        type: "academic"
      },
      {
        title: "Transport Fee Due Notice",
        message: "Please pay the pending transport/hostel fees before June 20th to avoid late fee penalties.",
        recipientRoles: ["parent"],
        type: "fee"
      },
      {
        title: "Tech Fest 2K26 Registration Open",
        message: "Registrations for the annual college Tech Fest are now open. Register at the department office.",
        recipientRoles: ["student", "faculty"],
        type: "general"
      }
    ];

    for (const ann of announcementsToCreate) {
      await Notification.create({
        senderId: adminUserDoc._id,
        recipientRoles: ann.recipientRoles,
        recipientIds: [],
        title: ann.title,
        message: ann.message,
        type: ann.type,
        readBy: []
      });
    }
    console.log("Seeded announcements/notifications successfully.");

    // 8.3 Seeding Summary Audit Report
    console.log("\n==================================================");
    console.log("          SEEDING SUMMARY AUDIT REPORT");
    console.log("==================================================");
    const totalUsers = await User.countDocuments({});
    const totalStudents = await Student.countDocuments({});
    const totalFaculty = await Faculty.countDocuments({});
    const totalParents = await Parent.countDocuments({});

    console.log(`Total User Documents:      ${totalUsers}`);
    console.log(`Total Student Documents:   ${totalStudents}`);
    console.log(`Total Faculty Documents:   ${totalFaculty}`);
    console.log(`Total Parent Documents:    ${totalParents}`);
    console.log("--------------------------------------------------");
    console.log("Faculty Employee ID mapping:");
    Object.entries(facultyEmployeeIdMap).forEach(([name, empId]) => {
      console.log(`  - ${name.padEnd(35)}: ${empId}`);
    });
    console.log("--------------------------------------------------");
    console.log("Default Login Credentials format:");
    console.log("  - Student: Username = roll number (no hyphens) (e.g. 245123735001), Pass = Welcome@2026");
    console.log("  - Faculty: Username = email prefix (e.g. sswapnarani_ece), Pass = Welcome@2026");
    console.log("  - Parent:  Username = parent_<student_username> (e.g. parent_245123735001), Pass = Welcome@2026");
    console.log("  - Admin:   Username = admin, Pass = Welcome@2026");
    console.log("==================================================");

    console.log("Database seeding completed successfully. Closing connection.");
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("CRITICAL SEEDER ERROR:", err);
    mongoose.connection.close();
    process.exit(1);
  }
};

runSeeder();

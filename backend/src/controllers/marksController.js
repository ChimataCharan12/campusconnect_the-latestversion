import Mark from "../models/Mark.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import TimetableSlot from "../models/TimetableSlot.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Helper: Verify parent permission for a student
const verifyParentAccess = async (parentUserId, studentId) => {
  const parentProfile = await Parent.findOne({ userId: parentUserId });
  if (!parentProfile) return false;
  return parentProfile.children.some((childId) => childId.toString() === studentId.toString());
};

const gradeFor = (score) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
};

const remarkFor = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Average";
  if (score >= 40) return "Satisfactory";
  return "Fail";
};

// @desc    Get all marks for a student
// @route   GET /api/marks/student/:studentId
// @access  Private (Self student, parent of child, faculty, admin)
export const getStudentMarks = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { role } = req.user;

    // Access control check
    if (role === "student") {
      const studentProfile = await Student.findOne({ userId: req.user._id });
      if (!studentProfile || studentProfile._id.toString() !== studentId) {
        return sendError(res, "Access denied. You can only view your own marks", 403);
      }
    } else if (role === "parent") {
      const hasAccess = await verifyParentAccess(req.user._id, studentId);
      if (!hasAccess) {
        return sendError(res, "Access denied. You can only view your children's marks", 403);
      }
    }

    const rawMarks = await Mark.find({ studentId });
    const slots = await TimetableSlot.find({});
    const subjectCodeMap = {};
    slots.forEach(s => {
      subjectCodeMap[s.subject] = s.code;
    });

    const subjectGroups = {};
    rawMarks.forEach(m => {
      if (!subjectGroups[m.subject]) {
        subjectGroups[m.subject] = [];
      }
      subjectGroups[m.subject].push(m);
    });

    const consolidated = Object.entries(subjectGroups).map(([subjectName, docs]) => {
      const internal1 = docs.find(d => d.examType === "Internal 1");
      const internal2 = docs.find(d => d.examType === "Internal 2");
      const semester = docs.find(d => d.examType === "Semester");

      let internal = 0;
      if (internal1) internal += internal1.marksObtained;
      if (internal2) internal += internal2.marksObtained;

      const external = semester?.marksObtained || 0;
      const total = internal + external;
      const percentage = total;
      const grade = gradeFor(total);
      const remark = semester?.remarks || internal1?.remarks || remarkFor(total);

      return {
        name: subjectName,
        code: subjectCodeMap[subjectName] || "CS301",
        internal,
        external,
        total,
        percentage,
        grade,
        remark
      };
    });

    return sendSuccess(res, "Student marks retrieved successfully", {
      count: consolidated.length,
      marks: consolidated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class marks details (Faculty and Admin)
// @route   GET /api/marks/class
// @access  Private (Faculty, Admin)
export const getClassMarks = async (req, res, next) => {
  try {
    const { branch, section, year, subject } = req.query;

    if (!branch || !section || !year || !subject) {
      return sendError(res, "branch, section, year, and subject parameters are required", 400);
    }

    // Find students in this class
    const students = await Student.find({
      branch,
      section,
      year: Number(year),
      isActive: true,
    }).populate("userId", "name");

    if (students.length === 0) {
      return sendSuccess(res, "No active students found in this class", { students: [] });
    }

    const studentIds = students.map((s) => s._id);

    // Find marks records for these students and this subject
    const marks = await Mark.find({
      studentId: { $in: studentIds },
      subject,
    });

    const studentMarksMap = {};
    marks.forEach(m => {
      const sid = m.studentId.toString();
      if (!studentMarksMap[sid]) {
        studentMarksMap[sid] = [];
      }
      studentMarksMap[sid].push(m);
    });

    const studentsWithMarks = students.map(s => {
      const docs = studentMarksMap[s._id.toString()] || [];
      const internal1 = docs.find(d => d.examType === "Internal 1");
      const internal2 = docs.find(d => d.examType === "Internal 2");
      const semester = docs.find(d => d.examType === "Semester");

      let internal = 0;
      if (internal1) internal += internal1.marksObtained;
      if (internal2) internal += internal2.marksObtained;

      const external = semester?.marksObtained || 0;
      const remarks = semester?.remarks || internal1?.remarks || "";

      return {
        _id: s._id,
        rollNumber: s.rollNumber,
        name: s.userId?.name || "",
        internal,
        external,
        remarks
      };
    });

    return sendSuccess(res, "Class marks retrieved successfully", {
      students: studentsWithMarks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or insert student marks (in bulk or single)
// @route   POST /api/marks/update
// @access  Private (Faculty, Admin)
export const updateStudentMarks = async (req, res, next) => {
  try {
    const { subject, marksData } = req.body;

    if (!subject || !marksData || !Array.isArray(marksData)) {
      return sendError(res, "subject and marksData (array) are required", 400);
    }

    for (const data of marksData) {
      const { studentId, internal, external, remarks } = data;

      // 1. Delete legacy Internal 2 and Assignment if they exist to prevent double counting
      await Mark.deleteMany({
        studentId,
        subject,
        examType: { $in: ["Internal 2", "Assignment"] }
      });

      // 2. Upsert Internal 1 (representing the full internal mark out of 40)
      await Mark.findOneAndUpdate(
        { studentId, subject, examType: "Internal 1" },
        {
          $set: {
            marksObtained: Number(internal) || 0,
            maxMarks: 40,
            remarks: "",
          }
        },
        { upsert: true, new: true }
      );

      // 3. Upsert Semester (representing the external mark out of 60)
      await Mark.findOneAndUpdate(
        { studentId, subject, examType: "Semester" },
        {
          $set: {
            marksObtained: Number(external) || 0,
            maxMarks: 60,
            remarks: remarks || "",
          }
        },
        { upsert: true, new: true }
      );
    }

    return sendSuccess(res, "Student marks updated successfully", {
      updatedCount: marksData.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get consolidated marks summary for all students (Admin only)
// @route   GET /api/marks/admin/summary
// @access  Private (Admin)
export const getAdminMarksSummary = async (req, res, next) => {
  try {
    const students = await Student.find({ isActive: true }).populate("userId", "name");
    const marks = await Mark.find({});

    const studentMarksMap = {};
    marks.forEach((m) => {
      const sid = m.studentId.toString();
      if (!studentMarksMap[sid]) {
        studentMarksMap[sid] = [];
      }
      studentMarksMap[sid].push(m);
    });

    const studentsWithMarks = students.map((s) => {
      const docs = studentMarksMap[s._id.toString()] || [];
      
      const subjectGroups = {};
      docs.forEach(d => {
        if (!subjectGroups[d.subject]) {
          subjectGroups[d.subject] = [];
        }
        subjectGroups[d.subject].push(d);
      });

      let totalSubjects = 0;
      let totalPercentageSum = 0;
      let passCount = 0;

      const subjectsList = Object.entries(subjectGroups).map(([sub, subDocs]) => {
        const internal1 = subDocs.find((d) => d.examType === "Internal 1");
        const internal2 = subDocs.find((d) => d.examType === "Internal 2");
        const semester = subDocs.find((d) => d.examType === "Semester");

        let internal = 0;
        if (internal1) internal += internal1.marksObtained;
        if (internal2) internal += internal2.marksObtained;

        const external = semester?.marksObtained || 0;
        const total = internal + external;
        totalSubjects++;
        totalPercentageSum += total;
        if (total >= 40) passCount++;

        return {
          subject: sub,
          internal,
          external,
          total,
        };
      });

      const avgPct = totalSubjects > 0 ? totalPercentageSum / totalSubjects : 0;
      const status = avgPct >= 40 ? "Pass" : "Fail";

      return {
        roll: s.rollNumber,
        name: s.userId?.name || "",
        dept: s.branch,
        sem: `${s.year}${s.year === 1 ? "st" : s.year === 2 ? "nd" : s.year === 3 ? "rd" : "th"} Year Sem ${s.semester}`,
        sub: totalSubjects,
        total: `${totalPercentageSum} / ${totalSubjects * 100}`,
        pct: Number(avgPct.toFixed(2)),
        grade: gradeFor(avgPct),
        status,
        studentId: s._id,
        subjects: subjectsList
      };
    });

    return sendSuccess(res, "Admin marks summary retrieved successfully", {
      students: studentsWithMarks,
    });
  } catch (error) {
    next(error);
  }
};

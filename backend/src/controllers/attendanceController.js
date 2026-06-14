import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Parent from "../models/Parent.js";
import { sendSuccess, sendError } from "../utils/response.js";

// Helper: Verify parent permission for a student
const verifyParentAccess = async (parentUserId, studentId) => {
  const parentProfile = await Parent.findOne({ userId: parentUserId });
  if (!parentProfile) return false;
  return parentProfile.children.some((childId) => childId.toString() === studentId.toString());
};

// @desc    Get detailed attendance logs for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private (Self student, parent of child, faculty, admin)
export const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { role } = req.user;

    // Access control check
    if (role === "student") {
      const studentProfile = await Student.findOne({ userId: req.user._id });
      if (!studentProfile || studentProfile._id.toString() !== studentId) {
        return sendError(res, "Access denied. You can only view your own attendance logs", 403);
      }
    } else if (role === "parent") {
      const hasAccess = await verifyParentAccess(req.user._id, studentId);
      if (!hasAccess) {
        return sendError(res, "Access denied. You can only view your children's attendance logs", 403);
      }
    }

    const { subject, startDate, endDate } = req.query;
    const filter = { studentId };

    if (subject) filter.subject = subject;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const logs = await Attendance.find(filter)
      .populate("markedBy", "name email")
      .sort({ date: -1 });

    return sendSuccess(res, "Student attendance logs retrieved successfully", {
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance percentage summary for a student
// @route   GET /api/attendance/summary/:studentId
// @access  Private (Self student, parent of child, faculty, admin)
export const getStudentAttendanceSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { role } = req.user;

    // Access control check
    if (role === "student") {
      const studentProfile = await Student.findOne({ userId: req.user._id });
      if (!studentProfile || studentProfile._id.toString() !== studentId) {
        return sendError(res, "Access denied. You can only view your own attendance summary", 403);
      }
    } else if (role === "parent") {
      const hasAccess = await verifyParentAccess(req.user._id, studentId);
      if (!hasAccess) {
        return sendError(res, "Access denied. You can only view your children's attendance summary", 403);
      }
    }

    const logs = await Attendance.find({ studentId });

    if (logs.length === 0) {
      return sendSuccess(res, "No attendance logs found for student", {
        overallPercentage: 0,
        totalClasses: 0,
        attended: 0,
        absent: 0,
        late: 0,
        subjectWise: {},
      });
    }

    const totalClasses = logs.length;
    let attended = 0;
    let absent = 0;
    let late = 0;

    const subjectStats = {};

    logs.forEach((log) => {
      // Overall counts
      if (log.status === "Present") attended++;
      else if (log.status === "Absent") absent++;
      else if (log.status === "Late") {
        late++;
        attended++; // Late counts as attended in overall calculation, or fractional depending on policy. We count as present.
      }

      // Subject-wise counts
      if (!subjectStats[log.subject]) {
        subjectStats[log.subject] = { total: 0, attended: 0, absent: 0, late: 0 };
      }
      subjectStats[log.subject].total++;
      if (log.status === "Present") subjectStats[log.subject].attended++;
      else if (log.status === "Absent") subjectStats[log.subject].absent++;
      else if (log.status === "Late") {
        subjectStats[log.subject].late++;
        subjectStats[log.subject].attended++;
      }
    });

    const overallPercentage = Math.round((attended / totalClasses) * 100);

    const subjectWise = {};
    Object.keys(subjectStats).forEach((subject) => {
      const stats = subjectStats[subject];
      subjectWise[subject] = {
        total: stats.total,
        attended: stats.attended,
        absent: stats.absent,
        late: stats.late,
        percentage: Math.round((stats.attended / stats.total) * 100),
      };
    });

    return sendSuccess(res, "Student attendance summary computed successfully", {
      overallPercentage,
      totalClasses,
      attended,
      absent,
      late,
      subjectWise,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a specific class/date (Faculty and Admin)
// @route   GET /api/attendance/class
// @access  Private (Faculty, Admin)
export const getClassAttendance = async (req, res, next) => {
  try {
    const { branch, section, year, date, subject } = req.query;

    if (!branch || !section || !year || !date || !subject) {
      return sendError(res, "branch, section, year, date, and subject parameters are required", 400);
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    // Find students in this class
    const students = await Student.find({
      branch,
      section,
      year: Number(year),
      isActive: true,
    });

    if (students.length === 0) {
      return sendSuccess(res, "No active students found in this class", { students: [], logs: [] });
    }

    const studentIds = students.map((s) => s._id);

    // Find attendance records for these students on this date and subject
    const logs = await Attendance.find({
      studentId: { $in: studentIds },
      subject,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate({
      path: "studentId",
      populate: { path: "userId", select: "name" },
    });

    return sendSuccess(res, "Class attendance records retrieved successfully", {
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin-level aggregate summary: attendance per class group
// @route   GET /api/attendance/admin/summary
// @access  Private (Admin only)
export const getAdminAttendanceSummary = async (req, res, next) => {
  try {
    // Get all unique branch/section/year groups from active students
    const groups = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { branch: "$branch", section: "$section", year: "$year" },
          studentIds: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.branch": 1, "_id.year": 1, "_id.section": 1 } },
    ]);

    const results = await Promise.all(
      groups.map(async (group) => {
        const { branch, section, year } = group._id;
        const studentIds = group.studentIds;

        // Today's attendance for these students
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayLogs = await Attendance.find({
          studentId: { $in: studentIds },
          date: { $gte: todayStart, $lte: todayEnd },
        });

        let present = 0;
        let absent = 0;
        let late = 0;

        todayLogs.forEach((log) => {
          if (log.status === "Present") {
            present++;
          } else if (log.status === "Late") {
            late++;
            present++;
          } else if (log.status === "Absent") {
            absent++;
          }
        });

        const records = todayLogs.length;
        const percentage = records > 0 ? Number(((present / records) * 100).toFixed(1)) : 0;
        const total = group.count;

        return {
          branch,
          section,
          year,
          label: `${branch} - ${year}Y ${section}`,
          total,      // student headcount
          records,    // count of today's logs
          present,    // present + late count
          absent,     // absent count
          late,       // late count
          percentage,
        };
      })
    );

    // Overall stats (across all students today)
    const allStudentIds = groups.flatMap((g) => g.studentIds);
    const todayStart2 = new Date();
    todayStart2.setHours(0, 0, 0, 0);
    const todayEnd2 = new Date();
    todayEnd2.setHours(23, 59, 59, 999);

    const allTodayLogs = await Attendance.find({
      studentId: { $in: allStudentIds },
      date: { $gte: todayStart2, $lte: todayEnd2 },
    });

    let overallPresent = 0;
    let overallAbsent = 0;
    let overallLate = 0;

    allTodayLogs.forEach((log) => {
      if (log.status === "Present") {
        overallPresent++;
      } else if (log.status === "Late") {
        overallLate++;
        overallPresent++;
      } else if (log.status === "Absent") {
        overallAbsent++;
      }
    });

    const totalRecords = allTodayLogs.length;
    const overallPercentage = totalRecords > 0 ? Number(((overallPresent / totalRecords) * 100).toFixed(1)) : 0;
    const totalStudents = allStudentIds.length;

    return sendSuccess(res, "Admin attendance summary retrieved", {
      classes: results,
      overall: {
        totalStudents,
        totalRecords,
        presentToday: overallPresent,
        absentToday: overallAbsent,
        lateToday: overallLate,
        overallPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance for student(s) in bulk
// @route   POST /api/attendance/mark
// @access  Private (Faculty, Admin)
export const markAttendance = async (req, res, next) => {
  try {
    const { subject, date, timetableSlotId, attendanceLogs } = req.body;

    if (!subject || !date || !attendanceLogs || !Array.isArray(attendanceLogs)) {
      return sendError(res, "subject, date, and attendanceLogs (array) are required", 400);
    }

    const parsedDate = new Date(date);
    const logDate = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));
    const markedBy = req.user._id;

    const operations = attendanceLogs.map((log) => {
      const { studentId, status, remarks } = log;
      return {
        updateOne: {
          filter: { studentId, subject, date: logDate },
          update: {
            $set: {
              timetableSlotId: timetableSlotId || null,
              status: status || "Present",
              remarks: remarks || "",
              markedBy,
            },
          },
          upsert: true,
        },
      };
    });

    await Attendance.bulkWrite(operations);

    return sendSuccess(res, "Attendance logs saved successfully", {
      markedCount: attendanceLogs.length,
    });
  } catch (error) {
    next(error);
  }
};

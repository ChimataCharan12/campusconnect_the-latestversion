import User from "../models/User.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Parent from "../models/Parent.js";
import Mark from "../models/Mark.js";
import Attendance from "../models/Attendance.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @desc    Get system dashboard metrics
// @route   GET /api/admin/metrics
// @access  Private (admin only)
export const getMetrics = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalFaculty, totalParents, totalMarks] =
      await Promise.all([
        User.countDocuments(),
        Student.countDocuments({ isActive: true }),
        Faculty.countDocuments({ isActive: true }),
        Parent.countDocuments({ isActive: true }),
        Mark.countDocuments(),
      ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // 1. Today's Attendance % calculation
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayLogsCount, todayPresentCount] = await Promise.all([
      Attendance.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
      Attendance.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ["Present", "Late"] }
      })
    ]);
    const todayAttendance = todayLogsCount > 0
      ? Number(((todayPresentCount / todayLogsCount) * 100).toFixed(2))
      : 0;

    // 2. Attendance Overview status breakdown
    const statusCounts = await Attendance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const counts = { Present: 0, Absent: 0, Late: 0 };
    statusCounts.forEach(item => {
      if (counts[item._id] !== undefined) {
        counts[item._id] = item.count;
      }
    });
    const totalAttendanceDocs = counts.Present + counts.Absent + counts.Late;
    const overallPercentage = totalAttendanceDocs > 0
      ? Number((((counts.Present + counts.Late) / totalAttendanceDocs) * 100).toFixed(2))
      : 0;

    // 3. Attendance Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trendLogs = await Attendance.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ["$status", ["Present", "Late"]] }, 1, 0]
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const attendanceTrend = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const formattedLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const match = trendLogs.find(log => log._id === dateStr);
      attendanceTrend.push({
        d: formattedLabel,
        v: match ? Number(((match.present / match.total) * 100).toFixed(2)) : 0
      });
    }

    // 4. Students by Department
    const studentsByBranch = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$branch", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const deptColors = ["#7c3aed", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899"];
    const studentsByDeptCount = studentsByBranch.reduce((sum, item) => sum + item.count, 0);
    const studentsByDepartment = studentsByBranch.map((item, idx) => {
      const pct = studentsByDeptCount > 0 ? ((item.count / studentsByDeptCount) * 100).toFixed(2) : 0;
      return {
        label: `${item._id} (${pct}%)`,
        value: item.count,
        color: deptColors[idx % deptColors.length]
      };
    });

    // 5. Marks Overview and statistics (consolidated by student & subject)
    const allMarks = await Mark.find({});
    const groupedMarks = {};
    allMarks.forEach(m => {
      const key = `${m.studentId}_${m.subject}`;
      if (!groupedMarks[key]) {
        groupedMarks[key] = [];
      }
      groupedMarks[key].push(m);
    });

    const totals = [];
    Object.values(groupedMarks).forEach(docs => {
      const internal1 = docs.find(d => d.examType === "Internal 1");
      const internal2 = docs.find(d => d.examType === "Internal 2");
      const semester = docs.find(d => d.examType === "Semester");

      let internal = 0;
      if (internal1) internal += internal1.marksObtained;
      if (internal2) internal += internal2.marksObtained;

      const external = semester?.marksObtained || 0;
      const total = internal + external;
      totals.push(total);
    });

    const marksCount = totals.length;
    const avgMarks = marksCount > 0 ? totals.reduce((s, v) => s + v, 0) / marksCount : 0;
    const maxMarksVal = marksCount > 0 ? Math.max(...totals) : 0;
    const minMarksVal = marksCount > 0 ? Math.min(...totals) : 0;
    const passCount = totals.filter(v => v >= 40).length;
    const passRate = marksCount > 0 ? (passCount / marksCount) * 100 : 0;

    const marksStats = {
      avg: Number(avgMarks.toFixed(2)),
      max: Number(maxMarksVal.toFixed(2)),
      min: Number(minMarksVal.toFixed(2)),
      passRate: Number(passRate.toFixed(2))
    };

    const activeStudents = await Student.find({ isActive: true });
    const studentBranchMap = {};
    activeStudents.forEach(s => {
      studentBranchMap[s._id.toString()] = s.branch;
    });

    const branchTotals = {};
    Object.entries(groupedMarks).forEach(([key, docs]) => {
      const studentId = key.split("_")[0];
      const branch = studentBranchMap[studentId];
      if (!branch) return;

      const internal1 = docs.find(d => d.examType === "Internal 1");
      const internal2 = docs.find(d => d.examType === "Internal 2");
      const semester = docs.find(d => d.examType === "Semester");

      let internal = 0;
      if (internal1) internal += internal1.marksObtained;
      if (internal2) internal += internal2.marksObtained;

      const external = semester?.marksObtained || 0;
      const total = internal + external;

      if (!branchTotals[branch]) {
        branchTotals[branch] = { sum: 0, count: 0 };
      }
      branchTotals[branch].sum += total;
      branchTotals[branch].count++;
    });

    const marksBars = Object.entries(branchTotals).map(([branch, item]) => ({
      d: branch,
      v: item.count > 0 ? Number((item.sum / item.count).toFixed(1)) : 0
    })).sort((a, b) => b.v - a.v);

    return sendSuccess(res, "Dashboard metrics retrieved successfully", {
      metrics: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalParents,
        totalMarks,
        usersByRole,
        todayAttendance,
        attendanceOverview: {
          present: counts.Present,
          absent: counts.Absent,
          late: counts.Late,
          overallPercentage
        },
        attendanceTrend,
        studentsByDepartment,
        marksStats,
        marksBars
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all system users
// @route   GET /api/admin/users
// @access  Private (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, "Users retrieved successfully", {
      total,
      page: Number(page),
      limit: Number(limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user account (admin only)
// @route   POST /api/admin/users
// @access  Private (admin only)
export const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role, name, subtitle } = req.body;

    if (!username || !email || !password || !role || !name) {
      return sendError(
        res,
        "username, email, password, role, and name are required",
        400
      );
    }

    const validRoles = ["student", "faculty", "parent", "admin"];
    if (!validRoles.includes(role)) {
      return sendError(
        res,
        `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        400
      );
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      return sendError(
        res,
        "Username or email is already registered in the system",
        400
      );
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: password,
      role,
      name,
      subtitle: subtitle || "",
    });

    return sendSuccess(
      res,
      "User account created successfully",
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          name: user.name,
          subtitle: user.subtitle,
          createdAt: user.createdAt,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (admin only)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Fetch role-specific profile
    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === "faculty") {
      profile = await Faculty.findOne({ userId: user._id });
    } else if (user.role === "parent") {
      profile = await Parent.findOne({ userId: user._id });
    }

    return sendSuccess(res, "User retrieved successfully", { user, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user account (admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (admin only)
export const updateUser = async (req, res, next) => {
  try {
    const allowedFields = ["name", "subtitle", "isActive"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, "No valid fields provided for update", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, "User updated successfully", { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user account and associated profile (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting their own account
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, "Admins cannot delete their own account", 403);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Remove linked profile based on role
    if (user.role === "student") {
      await Student.findOneAndDelete({ userId: user._id });
    } else if (user.role === "faculty") {
      await Faculty.findOneAndDelete({ userId: user._id });
    } else if (user.role === "parent") {
      await Parent.findOneAndDelete({ userId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    return sendSuccess(
      res,
      `User '${user.username}' and associated profile deleted successfully`,
      {}
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin's own profile
// @route   GET /api/admin/profile
// @access  Private (admin only)
export const getAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");

    return sendSuccess(res, "Admin profile retrieved successfully", { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin's own profile
// @route   PUT /api/admin/profile
// @access  Private (admin only)
export const updateAdminProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "subtitle", "photoUrl"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, "No valid fields provided for update", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    return sendSuccess(res, "Admin profile updated successfully", { user });
  } catch (error) {
    next(error);
  }
};

import TimetableSlot from "../models/TimetableSlot.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Parent from "../models/Parent.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @desc    Get timetable slots
// @route   GET /api/timetable
// @access  Private
export const getTimetable = async (req, res, next) => {
  try {
    const { role } = req.user;
    let filter = {};

    if (role === "student") {
      const studentProfile = await Student.findOne({ userId: req.user._id });
      if (!studentProfile) {
        return sendError(res, "Student profile not found", 404);
      }
      filter = {
        branch: studentProfile.branch,
        section: studentProfile.section,
        year: studentProfile.year,
        semester: studentProfile.semester,
      };
    } else if (role === "faculty") {
      const facultyProfile = await Faculty.findOne({ userId: req.user._id });
      if (!facultyProfile) {
        return sendError(res, "Faculty profile not found", 404);
      }
      filter = { facultyId: facultyProfile._id };
    } else if (role === "parent") {
      const parentProfile = await Parent.findOne({ userId: req.user._id });
      if (!parentProfile) {
        return sendError(res, "Parent profile not found", 404);
      }

      const { studentId } = req.query;
      if (!studentId) {
        return sendError(res, "studentId parameter is required for parents", 400);
      }

      // Verify that this student is a child of the parent
      const isChild = parentProfile.children.some(
        (childId) => childId.toString() === studentId
      );
      if (!isChild) {
        return sendError(res, "Access denied. You can only view your children's timetable", 403);
      }

      const studentProfile = await Student.findById(studentId);
      if (!studentProfile) {
        return sendError(res, "Student profile not found", 404);
      }

      filter = {
        branch: studentProfile.branch,
        section: studentProfile.section,
        year: studentProfile.year,
        semester: studentProfile.semester,
      };
    } else if (role === "admin") {
      // Admins can filter by custom query parameters
      const { branch, section, year, semester, facultyId } = req.query;
      if (branch) filter.branch = branch;
      if (section) filter.section = section;
      if (year) filter.year = Number(year);
      if (semester) filter.semester = Number(semester);
      if (facultyId) filter.facultyId = facultyId;
    } else {
      return sendError(res, "Invalid user role", 400);
    }

    const slots = await TimetableSlot.find(filter)
      .populate({
        path: "facultyId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ day: 1, startTime: 1 });

    return sendSuccess(res, "Timetable slots retrieved successfully", {
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new timetable slot
// @route   POST /api/timetable
// @access  Private (Admin only)
export const createTimetableSlot = async (req, res, next) => {
  try {
    const {
      subject,
      code,
      facultyId,
      day,
      startTime,
      endTime,
      room,
      branch,
      section,
      year,
      semester,
    } = req.body;

    if (
      !subject ||
      !facultyId ||
      !day ||
      !startTime ||
      !endTime ||
      !room ||
      !branch ||
      !section ||
      !year ||
      !semester
    ) {
      return sendError(res, "All fields except 'code' are required", 400);
    }

    // Verify Faculty exists
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return sendError(res, "Faculty member not found", 404);
    }

    const slot = await TimetableSlot.create({
      subject,
      code: code || "",
      facultyId,
      day,
      startTime,
      endTime,
      room,
      branch,
      section,
      year,
      semester,
    });

    const populatedSlot = await slot.populate({
      path: "facultyId",
      populate: { path: "userId", select: "name email" },
    });

    return sendSuccess(res, "Timetable slot created successfully", { slot: populatedSlot }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a timetable slot
// @route   PUT /api/timetable/:id
// @access  Private (Admin only)
export const updateTimetableSlot = async (req, res, next) => {
  try {
    const {
      subject,
      code,
      facultyId,
      day,
      startTime,
      endTime,
      room,
      branch,
      section,
      year,
      semester,
    } = req.body;

    const updates = {};
    if (subject !== undefined) updates.subject = subject;
    if (code !== undefined) updates.code = code;
    if (day !== undefined) updates.day = day;
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;
    if (room !== undefined) updates.room = room;
    if (branch !== undefined) updates.branch = branch;
    if (section !== undefined) updates.section = section;
    if (year !== undefined) updates.year = Number(year);
    if (semester !== undefined) updates.semester = Number(semester);

    if (facultyId !== undefined) {
      const faculty = await Faculty.findById(facultyId);
      if (!faculty) {
        return sendError(res, "Faculty member not found", 404);
      }
      updates.facultyId = facultyId;
    }

    const slot = await TimetableSlot.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate({
      path: "facultyId",
      populate: { path: "userId", select: "name email" },
    });

    if (!slot) {
      return sendError(res, "Timetable slot not found", 404);
    }

    return sendSuccess(res, "Timetable slot updated successfully", { slot });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a timetable slot
// @route   DELETE /api/timetable/:id
// @access  Private (Admin only)
export const deleteTimetableSlot = async (req, res, next) => {
  try {
    const slot = await TimetableSlot.findByIdAndDelete(req.params.id);
    if (!slot) {
      return sendError(res, "Timetable slot not found", 404);
    }
    return sendSuccess(res, "Timetable slot deleted successfully", {});
  } catch (error) {
    next(error);
  }
};

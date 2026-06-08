import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
    },
    timetableSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableSlot",
      default: null,
    },
    subject: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Attendance date is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["Present", "Absent", "Late"],
        message: "{VALUE} is not a valid attendance status",
      },
      default: "Present",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reference to the user who marked attendance is required"],
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance marks for a student on the same subject and date
attendanceSchema.index({ studentId: 1, subject: 1, date: 1 }, { unique: true });
// Index for fast search by student and date
attendanceSchema.index({ studentId: 1, date: -1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;

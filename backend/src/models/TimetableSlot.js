import mongoose from "mongoose";

const timetableSlotSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Faculty reference is required"],
    },
    day: {
      type: String,
      enum: {
        values: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        message: "{VALUE} is not a valid day of the week",
      },
      required: [true, "Day of the week is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format"],
    },
    room: {
      type: String,
      required: [true, "Room or location is required"],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      uppercase: true,
      trim: true,
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      uppercase: true,
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1, "Year must be between 1 and 4"],
      max: [4, "Year must be between 1 and 4"],
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be between 1 and 8"],
      max: [8, "Semester must be between 1 and 8"],
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for quick timetable lookup per class
timetableSlotSchema.index({ branch: 1, section: 1, year: 1, semester: 1, day: 1 });
// Index for faculty schedule lookup
timetableSlotSchema.index({ facultyId: 1, day: 1 });

const TimetableSlot = mongoose.model("TimetableSlot", timetableSlotSchema);
export default TimetableSlot;

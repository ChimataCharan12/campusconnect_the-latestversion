import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    examType: {
      type: String,
      enum: {
        values: ["Internal 1", "Internal 2", "Assignment", "Semester"],
        message: "{VALUE} is not a valid exam type",
      },
      required: [true, "Exam type is required"],
    },
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained is required"],
      min: [0, "Marks obtained cannot be less than 0"],
    },
    maxMarks: {
      type: Number,
      required: [true, "Maximum marks is required"],
      default: 100,
      min: [1, "Maximum marks must be at least 1"],
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

// Prevent duplicate entries for the same student, subject, and exam type
markSchema.index({ studentId: 1, subject: 1, examType: 1 }, { unique: true });

const Mark = mongoose.model("Mark", markSchema);
export default Mark;

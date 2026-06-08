import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 1,
      max: 4,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfBirth: {
      type: Date,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      default: null,
    },
    admissionYear: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries by branch/section/year
studentSchema.index({ branch: 1, section: 1, year: 1 });

const Student = mongoose.model("Student", studentSchema);

export default Student;

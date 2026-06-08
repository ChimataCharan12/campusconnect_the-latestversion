import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      // e.g. "Associate Professor", "Assistant Professor", "Professor"
    },
    subjects: {
      type: [String],
      default: [],
      // e.g. ["Data Structures", "DBMS", "Algorithms"]
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
    qualification: {
      type: String,
      trim: true,
      default: "",
      // e.g. "M.Tech", "Ph.D"
    },
    experience: {
      type: Number,
      default: 0,
      // years of experience
    },
    photoUrl: {
      type: String,
      default: "",
    },
    joiningDate: {
      type: Date,
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

// Index for department-level queries
facultySchema.index({ department: 1 });

const Faculty = mongoose.model("Faculty", facultySchema);

export default Faculty;

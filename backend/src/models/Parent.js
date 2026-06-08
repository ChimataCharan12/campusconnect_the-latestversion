import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    occupation: {
      type: String,
      trim: true,
      default: "",
    },
    relation: {
      type: String,
      enum: ["Father", "Mother", "Guardian", "Other"],
      default: "Father",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Parent = mongoose.model("Parent", parentSchema);

export default Parent;

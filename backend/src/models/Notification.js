import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender reference is required"],
    },
    recipientRoles: {
      type: [String],
      enum: ["student", "faculty", "parent", "admin"],
      default: [],
    },
    recipientIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ["academic", "fee", "general", "alert"],
        message: "{VALUE} is not a valid notification type",
      },
      default: "general",
    },
    readBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for query optimization
notificationSchema.index({ recipientRoles: 1, createdAt: -1 });
notificationSchema.index({ recipientIds: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

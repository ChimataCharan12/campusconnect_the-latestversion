import Notification from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @desc    Get user's notification inbox
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;

    const notifications = await Notification.find({
      $or: [
        { recipientIds: userId },
        { recipientRoles: role },
      ],
    })
      .populate("senderId", "name email role")
      .sort({ createdAt: -1 });

    // Format output to indicate read status
    const formattedNotifications = notifications.map((n) => {
      const notificationObj = n.toObject();
      notificationObj.isRead = n.readBy.some((id) => id.toString() === userId.toString());
      return notificationObj;
    });

    return sendSuccess(res, "Notifications retrieved successfully", {
      count: formattedNotifications.length,
      notifications: formattedNotifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Broadcast notification
// @route   POST /api/notifications
// @access  Private (Faculty, Admin)
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, recipientRoles, recipientIds, type } = req.body;
    const senderId = req.user._id;

    if (!title || !message) {
      return sendError(res, "Title and message are required", 400);
    }

    const notification = await Notification.create({
      senderId,
      recipientRoles: recipientRoles || [],
      recipientIds: recipientIds || [],
      title,
      message,
      type: type || "general",
      readBy: [],
    });

    const populatedNotification = await notification.populate("senderId", "name email role");

    return sendSuccess(res, "Notification created successfully", { notification: populatedNotification }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return sendError(res, "Notification not found", 404);
    }

    // Verify recipient permissions
    const isRecipient =
      notification.recipientIds.some((id) => id.toString() === userId.toString()) ||
      notification.recipientRoles.includes(req.user.role);

    if (!isRecipient) {
      return sendError(res, "Access denied. You are not a recipient of this notification", 403);
    }

    if (!notification.readBy.some((id) => id.toString() === userId.toString())) {
      notification.readBy.push(userId);
      await notification.save();
    }

    return sendSuccess(res, "Notification marked as read", {
      id: notification._id,
      isRead: true,
    });
  } catch (error) {
    next(error);
  }
};

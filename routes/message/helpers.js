const User = require("../../models/userSchema");

/**
 * Middleware to check authentication
 */
const checkAuth = (req, res, next) => {
  const userId = req.session?.user?._id;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  req.userId = userId;
  next();
};

/**
 * Helper function to format chat data
 */
const formatChatData = (chat) => {
  return {
    _id: chat._id,
    participants: chat.participants.map((participant) => ({
      _id: participant._id,
      name: `${participant.firstName} ${participant.lastName}`,
      role: participant.role,
    })),
    messages: chat.messages.map((message) => ({
      _id: message._id,
      content: message.content,
      sender: {
        _id: message.sender._id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        role: message.sender.role,
      },
      timestamp: message.timestamp,
      isRead: message.isRead,
    })),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
};

/**
 * Helper function to check if user is participant in chat
 */
const isParticipant = (chat, userId) => {
  return chat.participants.some(
    (participant) => participant._id.toString() === userId
  );
};

/**
 * Helper function to get other participant in chat
 */
const getOtherParticipant = (chat, currentUserId) => {
  return chat.participants.find(
    (participant) => participant._id.toString() !== currentUserId
  );
};

module.exports = {
  checkAuth,
  formatChatData,
  isParticipant,
  getOtherParticipant,
};

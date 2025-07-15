const express = require("express");
const router = express.Router();
const Chat = require("../../models/messageSchema");
const { checkAuth, isParticipant } = require("./helpers");

// Send a message in a chat
router.post("/chats/:chatId/messages", checkAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const { content } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if the user is a participant in this chat
    if (!isParticipant(chat, userId)) {
      return res.status(403).json({ error: "Not authorized to send messages in this chat" });
    }

    chat.messages.push({
      sender: userId,
      content,
      timestamp: new Date(),
    });
    await chat.save();

    // Populate the sender information for the new message
    const populatedChat = await Chat.findById(chatId).populate(
      "messages.sender",
      "firstName lastName role"
    );

    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
    const formattedMessage = {
      _id: newMessage._id,
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      sender: {
        _id: newMessage.sender._id,
        name: `${newMessage.sender.firstName} ${newMessage.sender.lastName}`,
        role: newMessage.sender.role,
      },
    };

    res.status(200).json({ message: "Message sent successfully", message: formattedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Get all chats for the current user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name email role')
      .populate('messages.sender', 'name email role')
      .sort({ lastMessage: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get or create a chat with another user
router.get('/:userId', auth, async (req, res) => {
  try {
    // Validate user ID
    if (!req.params.userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if the user exists
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate user roles
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    // Check if users can chat based on their roles
    const canChat = (
      (currentUser.role === 'faculty' && otherUser.role === 'student') ||
      (currentUser.role === 'student' && otherUser.role === 'faculty')
    );

    if (!canChat) {
      return res.status(403).json({ 
        message: 'Chat is only allowed between faculty and students' 
      });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, req.params.userId] }
    })
    .populate('participants', 'name email role')
    .populate('messages.sender', 'name email role');

    if (!chat) {
      chat = new Chat({
        participants: [req.user.id, req.params.userId],
        messages: []
      });
      await chat.save();
      chat = await chat.populate([
        { path: 'participants', select: 'name email role' },
        { path: 'messages.sender', select: 'name email role' }
      ]);
    }

    res.json(chat);
  } catch (error) {
    console.error('Error getting/creating chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = {
      sender: req.user.id,
      content: req.body.content.trim(),
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(message);
    chat.lastMessage = message.timestamp;
    chat.lastMessageContent = message.content;
    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name email role')
      .populate('messages.sender', 'name email role');

    res.json(populatedChat);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    let updated = false;
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user.id && !message.read) {
        message.read = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name email role')
      .populate('messages.sender', 'name email role');

    res.json(populatedChat);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const cloudinary = require('../config/cloudinary');
const { authenticateToken } = require('../middleware/auth');

// Get messages
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.userId, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send text message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    const newMessage = new Message({
      senderId: req.user.userId,
      receiverId,
      content,
      messageType: 'text'
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Image message route
router.post('/image', authenticateToken, async (req, res) => {
  try {
    if (!req.body.image || !req.body.receiverId) {
      return res.status(400).json({ message: 'Image and receiverId are required' });
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(req.body.image, {
      folder: 'chat_images',
      resource_type: 'auto',
      max_bytes: 10 * 1024 * 1024, // 10MB
      timeout: 60000 // 60 seconds
    });

    const newMessage = new Message({
      senderId: req.user.userId,
      receiverId: req.body.receiverId,
      content: req.body.content || '',
      messageType: 'image',
      imageUrl: uploadResponse.secure_url
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email');

    // Emit socket event
    if (req.io) {
      req.io.to(req.body.receiverId).emit('new_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Add this route to handle likes
router.post('/:messageId/like', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Toggle isLiked
    message.isLiked = !message.isLiked;
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name email profilePic')
      .populate('receiverId', 'name email profilePic');

    // Emit socket event to both sender and receiver
    if (req.io) {
      req.io.to(message.senderId.toString()).emit('message_updated', populatedMessage);
      req.io.to(message.receiverId.toString()).emit('message_updated', populatedMessage);
    }

    res.json(populatedMessage);
  } catch (error) {
    console.error('Error updating like:', error);
    res.status(500).json({ message: 'Error updating like' });
  }
});

module.exports = router; 
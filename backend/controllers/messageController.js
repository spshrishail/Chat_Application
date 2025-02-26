const Message = require('../models/Message');
const cloudinary = require('../config/cloudinary');

exports.sendMessage = async (req, res) => {
  try {
    const { recipient, content, messageType } = req.body;
    let messageContent = content;

    if (messageType === 'image') {
      const uploadResponse = await cloudinary.uploader.upload(content, {
        folder: 'chatify_messages'
      });
      messageContent = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      recipient,
      content: messageContent,
      messageType
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name profilePic')
      .populate('recipient', 'name profilePic');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
      .populate('sender', 'name profilePic')
      .populate('recipient', 'name profilePic')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likeMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.isLiked = !message.isLiked;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
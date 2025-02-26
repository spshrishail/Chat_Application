const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getMessages,
  likeMessage
} = require('../controllers/messageController');

router.post('/', protect, sendMessage);
router.get('/:userId', protect, getMessages);
router.put('/like/:messageId', protect, likeMessage);

module.exports = router; 
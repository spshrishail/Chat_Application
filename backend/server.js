require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// Update CORS configuration for production
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Socket.io setup with correct CORS
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Chatify API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// Socket middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  socket.join(socket.userId);

  socket.on('send_message', (message) => {
    io.to(message.senderId._id).emit('new_message', message);
    io.to(message.receiverId._id).emit('new_message', message);
  });

  socket.on('message_update', ({ messageId, updates, receiverId }) => {
    io.to(socket.userId).to(receiverId).emit('message_updated', {
      messageId,
      updates
    });
  });

  socket.on('message_like', (data) => {
    io.to(data.senderId).emit('message_updated', data.message);
    io.to(data.receiverId).emit('message_updated', data.message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 8080;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Export for Vercel
module.exports = app;

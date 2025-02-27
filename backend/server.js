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

// CORS configuration
app.use(cors({
  origin: ['https://chatapplication-two-kappa.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Body parser
app.use(express.json());

// Basic route to test if server is running
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Chatify API' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: ['https://chatapplication-two-kappa.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
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

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app; 

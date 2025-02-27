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

// Update CORS configuration
app.use(cors({
  origin: ['https://chatapplication-two-kappa.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Socket.io setup with correct CORS
const io = socketIo(server, {
  cors: {
    origin: ['https://chatapplication-two-kappa.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

// Middleware
app.use(express.json());

// Add this middleware before your routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://chatapplication-two-kappa.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Add this before your routes
app.use((req, res, next) => {
  res.setTimeout(25000, () => {
    res.status(504).send('Request Timeout');
  });
  next();
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

// Add this after your routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// MongoDB connection with timeout settings
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
  socketTimeoutMS: 45000, // Close sockets after 45s
})
.then(() => {
  console.log('Connected to MongoDB');
  server.listen(process.env.PORT || 8080, () => {
    console.log(`Server running on port ${process.env.PORT || 8080}`);
  });
})
.catch(err => console.error('MongoDB connection error:', err));

// Export for Vercel
module.exports = app; 

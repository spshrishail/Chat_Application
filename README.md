# Chatify - Real-Time Chat Application

A modern, real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time communication.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Authentication**: Secure JWT-based authentication
- **Emoji Support**: Built-in emoji picker for expressive conversations
- **Message Updates**: Edit and delete messages in real-time
- **Like Messages**: React to messages with likes
- **Modern UI**: Clean and responsive design using Material-UI
- **Real-time Status**: See when users are online/offline
- **Secure**: Protected routes and encrypted passwords

## 🛠️ Tech Stack

### Frontend
- React.js
- Material-UI (MUI)
- Socket.IO Client
- Axios for HTTP requests
- React Router for navigation
- React Hook Form for form handling
- React Toastify for notifications
- Emoji Picker React
- Moment.js for time formatting

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT for authentication
- Bcrypt for password hashing
- CORS for cross-origin requests

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/spshrishail/Chat_Application.git
   cd Chat_Application
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**

   Create `.env` file in backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=8080
   FRONTEND_URL=http://localhost:5173
   ```

   Create `.env` file in frontend directory:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. **Start the application**
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # In a new terminal, start frontend
   cd frontend
   npm run dev
   ```

## 🌐 Usage

1. Register a new account or login with existing credentials
2. Start chatting with other users in real-time
3. Send messages, emojis, and like messages
4. Edit or delete your messages
5. View online/offline status of other users

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Messages
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages` - Send new message
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

## 🚀 Deployment

The application is configured for deployment on Vercel:

- Frontend is deployed as a static site
- Backend is deployed as serverless functions
- Automatic deployments on push to main branch
- Environment variables managed through Vercel dashboard

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shrishail SP**
- GitHub: [@spshrishail](https://github.com/spshrishail)

## 🙏 Acknowledgments

- Material-UI for the beautiful components
- Socket.IO for real-time capabilities
- MongoDB Atlas for database hosting
- Vercel for hosting the application

# Realtime Chat App 💬

A modern, feature-rich real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. This application supports real-time messaging, file uploads, voice messages, AI-powered features, and comprehensive user management.

## ✨ Features

- **Real-time Messaging**: Instant messaging powered by Socket.io.
- **Group Chats**: Create and manage group conversations.
- **Voice Messages**: Record and send voice notes directly in the chat.
- **File Sharing**: Upload and share images and files (powered by Firebase Storage).
- **AI Integration**:
  - **Smart Replies**: AI-generated reply suggestions for quick responses.
  - **Conversation Summaries**: Get a quick summary of your lengthy chats.
- **User Management**:
  - Secure Authentication (JWT).
  - Profile Management (Avatar, Status).
  - Friend Request System (Send, Accept, Reject).
- **Responsive Design**: Optimized for different screen sizes.

## 🛠️ Tech Stack

**Frontend:**
- **Framework**: React (Vite)
- **State Management**: Zustand
- **Styling**: CSS / Styled Components
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Storage**: Firebase Storage (for media)

**Backend:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JsonWebToken (JWT), BCrypt, Cookie Parser
- **Real-time**: Socket.io
- **File Handling**: Multer (Server-side)

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Firebase Project](https://firebase.google.com/) (for storage)
- [Gemini API Key](https://ai.google.dev/) (for AI features)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd realtime-chat-app
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

**Environment Variables:**

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=3001
DATABASE_URL=mongodb+srv://<your-db-url>
JWT_KEY=your_super_secret_jwt_key
ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:

```bash
npm run dev
```
The server should be running at `http://localhost:3001`.

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

**Environment Variables:**

Create a `.env` file in the `frontend` directory with the following variables:

```env
VITE_SERVER_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the frontend development server:

```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## � Project Structure

```
realtime-chat-app/
├── backend/                # Node.js/Express Backend
│   ├── controllers/        # Route Logic
│   ├── middlewares/        # Auth & Error Handling
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Routes
│   ├── socket.js           # Socket.io Logic
│   └── index.js            # Entry Point
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable Components
│   │   ├── context/        # React Context
│   │   ├── lib/            # Utilities (API, Firebase)
│   │   ├── pages/          # Application Pages
│   │   ├── store/          # Zustand Store
│   │   └── utils/          # Constants & Hooks
│   └── public/             # Static Assets
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request.


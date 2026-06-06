🚀 AI Powered Team Collaboration Platform

A full-stack real-time collaboration platform built with the MERN stack + Socket.io + AI integrations (Groq).
This platform enables teams to communicate, manage workspaces, collaborate in real-time, and use AI-powered features like summarization and assistant support.


✨ Features
🔐 Authentication
JWT-based authentication
Secure login/register system
HTTP-only cookie support
🏢 Workspace Management
Create / join / delete workspaces
Invite code system
Role-based access control
💬 Real-Time Communication
Real-time messaging using Socket.io
Channel-based chat system
Message deletion
Typing indicators
Online user status tracking
📢 Channel System
Create and manage channels inside workspace
Join/leave channels dynamically
Live updates across users
📝 Notes System
Rich text editor support
Auto-save functionality
Notes CRUD (create, update, delete)
Ownership-based access
🤖 AI Features
AI-powered notes summarization (Groq API)
Workspace AI assistant chatbot
Smart context-based responses
🎨 Frontend Features
React + Redux Toolkit state management
Protected routes
Responsive UI design
Dashboard with workspace overview
Real-time chat UI

🧠 Tech Stack
Frontend
React.js
Redux Toolkit
React Router
Axios
Tailwind CSS
Backend
Node.js
Express.js
MongoDB + Mongoose
Socket.io
JWT Authentication
Cookie Parser
CORS
AI Integration
Groq API (LLM-based summarization & assistant)

⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/chaitanyasravanthi-marpina/ai-powered-team-collabration-platform.git
cd ai-powered-team-collabration-platform

2. Setup Backend
cd server
npm install

Create .env file:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173

Run server:
npm run dev

3. Setup Frontend
cd client
npm install
npm run dev

🔥 Project Architecture

Client (React + Redux)
        ↓
REST APIs (Express)
        ↓
MongoDB Database
        ↓
Socket.io (Real-time layer)
        ↓
Groq AI API (Summarization & Assistant)

🚀 Future Improvements
File sharing in chat
Video/audio calls (WebRTC)
Advanced AI agent (task automation)
Mobile responsive PWA
Notifications system

👨‍💻 Author

Chaitanya Sravanthi
GitHub: @chaitanyasravanthi-marpina

⭐ If you like this project

Give it a ⭐ on GitHub — it helps a lot!
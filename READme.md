# 🤝 AI-Powered Team Collaboration Platform

A full-stack real-time team collaboration web application built as a learning project using the **MERN Stack**. Inspired by Slack + Notion + AI Assistant.


---

## 🔗 Links

- 🌐 **Live Demo:** [https://ai-powered-team-collabration-platfo.vercel.app]
- 💻 **GitHub:** [https://github.com/chaitanyasravanthi-marpina/ai-powered-team-collabration-platform](https://github.com/chaitanyasravanthi-marpina/ai-powered-team-collabration-platform)

---

## 💡 What is this project?

This is a team collaboration platform where:
- Teams can **create workspaces** and invite members
- Members can **chat in real-time** inside channels
- Teams can **write and share notes** with rich text
- An **AI assistant** can summarize notes and answer questions about your workspace

Think of it like a simplified version of Slack + Notion with an AI assistant built in.

---

## ✨ Features

### 🔐 User Authentication
- Register and Login with email and password
- Passwords are securely hashed using **bcrypt**
- Sessions managed with **JWT tokens** stored in httpOnly cookies
- Auto login on page refresh

### 🏢 Workspace Management
- Create a workspace for your team or project
- Share an **invite code** so others can join
- Admin and Member **roles** — only admins can create/delete channels
- Delete workspace (removes all related data automatically)

### 💬 Real-Time Chat
- Send and receive messages **instantly** using **Socket.io**
- Each channel is a separate chat room
- See **typing indicators** when someone is typing
- See who is **online or offline** in real-time
- Delete your own messages

### 📝 Notes System
- Create notes for your team (like Google Docs inside your workspace)
- **Rich text editor** — bold, italic, bullet points, headings
- Notes **auto-save** every 500ms while you type
- Only the note creator or admin can delete notes

### 🤖 AI Features (Powered by Groq / Llama 3)
- **Summarize any note** with one click using AI
- **Ask the AI assistant** questions about your workspace notes
  - Example: *"What was decided in the sprint planning meeting?"*
  - AI searches relevant notes and gives you an accurate answer

### 👥 Online Status
- Members panel showing all workspace members
- Green dot = online, Gray dot = offline
- Updates in real-time as members join or leave

---

## 🛠️ Technologies Used

### Backend
| Technology | What I used it for |
|---|---|
| Node.js | Server-side JavaScript runtime |
| Express.js | Building REST APIs |
| MongoDB | Storing all application data |
| Mongoose | MongoDB schema and model management |
| Socket.io | Real-time bidirectional communication |
| JWT (jsonwebtoken) | User authentication tokens |
| bcryptjs | Password hashing |
| Groq API | AI features (note summarization, Q&A) |

### Frontend
| Technology | What I used it for |
|---|---|
| React.js | Building the user interface |
| Vite | Fast development build tool |
| Redux Toolkit | Managing global application state |
| React Router | Page navigation and protected routes |
| Tailwind CSS | Styling the UI |
| Socket.io Client | Connecting to real-time server |
| React Quill | Rich text editor for notes |
| Axios | Making HTTP requests to the backend |

---

## 📁 Project Structure

```
ai-powered-team-collabration-platform/
│
├── client/                  ← React Frontend
│   └── src/
│       ├── app/             ← Redux store setup
│       ├── components/      ← Reusable UI components
│       │   ├── channel/     ← Chat components
│       │   └── notes/       ← Notes + AI components
│       ├── features/        ← Redux slices (state)
│       ├── pages/           ← Full page components
│       ├── services/        ← Axios API setup
│       └── socket/          ← Socket.io client setup
│
└── server/                  ← Node.js Backend
    ├── config/              ← Database connection
    ├── controllers/         ← API request handlers
    ├── middleware/          ← Auth and role checks
    ├── models/              ← MongoDB schemas
    ├── routes/              ← API route definitions
    ├── services/            ← AI service (Groq)
    └── socket/              ← Socket.io event handlers
```

---

## 🚀 How to Run Locally

### Step 1 — Clone the project
```bash
git clone https://github.com/chaitanyasravanthi-marpina/ai-powered-team-collabration-platform.git
cd ai-powered-team-collabration-platform
```

### Step 2 — Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_random_secret_string
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key
```

> Get a free MongoDB URI at [mongodb.com/atlas](https://mongodb.com/atlas)
> Get a free Groq API key at [console.groq.com](https://console.groq.com)

### Step 3 — Setup the Frontend
```bash
cd ../client
npm install
```

### Step 4 — Run both servers

Open **two terminals**:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Step 5 — Open in browser
```
http://localhost:5173
```

---

## 📖 How to Use

1. **Register** an account
2. **Create a workspace** from the dashboard
3. Copy the **invite code** and share it with your teammates
4. **Create a channel** (e.g., #general, #backend)
5. Start **chatting** in real-time
6. Switch to the **Notes tab** to create team notes
7. Click **✨ Summarize** to get an AI summary of any note
8. Click **🤖 AI Assistant** to ask questions about your notes

---

## 🧠 What I Learned Building This

- How **JWT authentication** works with httpOnly cookies
- Building **REST APIs** with Express and proper error handling
- **Real-time communication** using Socket.io and WebSockets
- **Database design** with MongoDB — relationships, referencing vs embedding
- **Role-based access control** (RBAC) — admin vs member permissions
- **Redux Toolkit** for managing complex application state
- Integrating **AI/LLM APIs** and basic **RAG** (Retrieval Augmented Generation)
- **Debouncing** for auto-save functionality
- How to structure a full-stack **MERN application** professionally
- **Git version control** with branches and conventional commits

---

## 🔮 Future Improvements

- [ ] File uploads (images, PDFs) using Cloudinary
- [ ] Mobile responsive design
- [ ] Email notifications when mentioned
- [ ] Search messages and notes
- [ ] Emoji reactions on messages
- [ ] Dark mode
- [ ] Better AI with vector search (embeddings)

---

## 👨‍💻 About Me

**Chaitanya Sravanthi Marpina**
Computer Science Student

I built this project to learn full-stack web development with the MERN stack. This project covers authentication, real-time systems, database design, state management, and AI integration — everything I needed to understand modern web development.

[![GitHub](https://img.shields.io/badge/GitHub-chaitanyasravanthi--marpina-black?style=flat&logo=github)](https://github.com/chaitanyasravanthi-marpina)

---

## 📄 License

This project is open source — feel free to use it for learning purposes.

---

> ⭐ If you found this project helpful or interesting, please give it a star on GitHub!

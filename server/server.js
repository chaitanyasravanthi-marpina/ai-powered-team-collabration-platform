import dotenv from 'dotenv'
dotenv.config()
console.log('API KEY EXISTS:', !!process.env.GROQ_API_KEY);



import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'    // ← move to top
import { dirname } from 'path'         // ← move to top
import connectDB from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import workspaceRoutes from './routes/workspace.routes.js'
import channelRoutes from './routes/channel.routes.js'
import messageRoutes from './routes/message.routes.js'
import noteRoutes from './routes/note.routes.js'
import aiRoutes from './routes/ai.routes.js'
import { setupSocket } from './socket/socket.js'

connectDB()

const app = express()

// Create HTTP server wrapping Express
// Socket.io needs raw HTTP server, not just Express
const httpServer = createServer(app)

// Attach Socket.io to HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
})

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Serve test file
app.use(express.static(__dirname))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/workspaces/:workspaceId/channels', channelRoutes)
app.use('/api/workspaces/:workspaceId/channels', messageRoutes)
app.use('/api/workspaces/:workspaceId/notes', noteRoutes)
app.use('/api/workspaces/:workspaceId/ai', aiRoutes)

// Global error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    })
  }
  next(err)
})

// ─── Socket.io Logic ──────────────────────────────────────────

setupSocket(io)

// Use httpServer instead of app to listen
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
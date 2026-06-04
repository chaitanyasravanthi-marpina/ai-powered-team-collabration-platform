import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'

// Import routes
import authRoutes from './routes/auth.routes.js'
import workspaceRoutes from './routes/workspace.routes.js'
import channelRoutes from './routes/channel.routes.js'
import messageRoutes from './routes/message.routes.js'

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
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Serve test file
app.use(express.static(__dirname))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/workspaces/:workspaceId/channels', channelRoutes)
app.use('/api/workspaces/:workspaceId/channels', messageRoutes)

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
import { setupSocket } from './socket/socket.js'
setupSocket(io)

// Use httpServer instead of app to listen
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
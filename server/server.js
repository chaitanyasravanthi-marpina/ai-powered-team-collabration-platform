import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

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
const httpServer = createServer(app)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ai-powered-team-collabration-platfo.vercel.app',
  'https://ai-powered-tea-git-8699b9-chaitanya-sravanthi-marpinas-projects.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean)

console.log('Allowed origins:', allowedOrigins)

app.use(express.json())
app.use(cookieParser())

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('Blocked by CORS:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use(express.static(__dirname))

app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/workspaces/:workspaceId/channels', channelRoutes)
app.use('/api/workspaces/:workspaceId/channels', messageRoutes)
app.use('/api/workspaces/:workspaceId/notes', noteRoutes)
app.use('/api/workspaces/:workspaceId/ai', aiRoutes)

setupSocket(io)

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    })
  }
  next(err)
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
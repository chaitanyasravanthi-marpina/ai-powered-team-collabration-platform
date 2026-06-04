// Step 1 - Load environment variables FIRST
// Must be before anything else that needs env variables
import dotenv from 'dotenv'
dotenv.config()

// Step 2 - Import packages
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import workspaceRoutes from './routes/workspace.routes.js'
import channelRoutes from './routes/channel.routes.js'


// Step 3 - Connect to database
connectDB()

// Step 4 - Create Express app
const app = express()

// Step 5 - Register Middleware
// These run on EVERY request before reaching routes
app.use(express.json())         // Parse JSON request bodies
app.use(cookieParser())         // Parse cookies
app.use(cors({
  origin: 'http://localhost:5173',  // React app URL
  credentials: true                  // Allow cookies
}))
app.use('/api/auth', authRoutes)
app.use('/api/workspaces',workspaceRoutes)
// Must be registered as nested route under workspaces
app.use('/api/workspaces/:workspaceId/channels', channelRoutes)


// Step 6 - Routes (we'll add these soon)
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

// Step 7 - Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Message from '../models/Message.js'
import Channel from '../models/Channel.js'

export const setupSocket = (io) => {

  // ─── Auth Middleware for Socket ─────────────────────────────
  // Every socket connection must have valid JWT
  io.use(async (socket, next) => {
    try {
      // Get token from cookie sent during connection
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId)

      if (!user) {
        return next(new Error('User not found'))
      }

      // Attach user to socket
      socket.user = user
      next()

    } catch (error) {
      next(new Error('Invalid token'))
    }
  })

  // ─── Connection Handler ──────────────────────────────────────
  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.name}`)

    // Update user online status
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true })

    // Broadcast to everyone that this user is online
    io.emit('user-online', { userId: socket.user._id })

    // ─── Join Channel Room ─────────────────────────────────────
    socket.on('join-channel', async (channelId) => {
      // Leave all previous rooms first
      // User can only be in one channel at a time
      const rooms = Array.from(socket.rooms)
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })

      // Join new channel room
      socket.join(channelId)
      console.log(`${socket.user.name} joined channel: ${channelId}`)

      // Send last 50 messages to user who just joined
      const messages = await Message.find({ channelId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(50)

      // Reverse so oldest message appears first
      socket.emit('previous-messages', messages.reverse())
    })

    // ─── Send Message ──────────────────────────────────────────
    socket.on('send-message', async (data) => {
      try {
        const { channelId, workspaceId, content } = data

        // Verify channel exists
        const channel = await Channel.findById(channelId)
        if (!channel) {
          socket.emit('error', { message: 'Channel not found' })
          return
        }

        // Save message to database
        const message = await Message.create({
          content,
          channelId,
          workspaceId,
          sender: socket.user._id
        })

        // Populate sender details
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatar')

        // Emit to EVERYONE in the channel room including sender
        io.to(channelId).emit('new-message', populatedMessage)

      } catch (error) {
        socket.emit('error', { message: error.message })
      }
    })

    // ─── Typing Indicators ────────────────────────────────────
    socket.on('typing', (channelId) => {
      // Broadcast to everyone in room EXCEPT sender
      socket.to(channelId).emit('user-typing', {
        userId: socket.user._id,
        name: socket.user.name
      })
    })

    socket.on('stop-typing', (channelId) => {
      socket.to(channelId).emit('user-stop-typing', {
        userId: socket.user._id
      })
    })

    // ─── Disconnect ────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.name}`)

      await User.findByIdAndUpdate(socket.user._id, { isOnline: false })

      io.emit('user-offline', { userId: socket.user._id })
    })
  })
}
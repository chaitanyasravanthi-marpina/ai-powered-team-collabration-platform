import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Message from '../models/Message.js'
import Channel from '../models/Channel.js'

export const setupSocket = (io) => {

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) return next(new Error('Authentication required'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId)
      if (!user) return next(new Error('User not found'))

      socket.user = user
      next()
    } catch (error) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.name}`)

    await User.findByIdAndUpdate(socket.user._id, { isOnline: true })
    io.emit('user-online', { userId: socket.user._id })

    socket.on('join-channel', async (channelId) => {
      const rooms = Array.from(socket.rooms)
      rooms.forEach(room => {
        if (room !== socket.id) socket.leave(room)
      })

      socket.join(channelId)
      console.log(`${socket.user.name} joined channel: ${channelId}`)

      const messages = await Message.find({ channelId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(50)

      socket.emit('previous-messages', messages.reverse())
    })

    socket.on('send-message', async (data) => {
      try {
        const { channelId, workspaceId, content } = data

        const channel = await Channel.findById(channelId)
        if (!channel) {
          socket.emit('error', { message: 'Channel not found' })
          return
        }

        const message = await Message.create({
          content,
          channelId,
          workspaceId,
          sender: socket.user._id
        })

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatar')

        io.to(channelId).emit('new-message', populatedMessage)

      } catch (error) {
        socket.emit('error', { message: error.message })
      }
    })

    socket.on('delete-message', async (data) => {
      try {
        const { messageId, channelId } = data
        const message = await Message.findById(messageId)

        if (!message) return

        if (message.sender.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Cannot delete others messages' })
          return
        }

        await message.deleteOne()
        io.to(channelId).emit('message-deleted', { messageId })

      } catch (error) {
        socket.emit('error', { message: error.message })
      }
    })

    socket.on('typing', (channelId) => {
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

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.name}`)
      await User.findByIdAndUpdate(socket.user._id, { isOnline: false })
      io.emit('user-offline', { userId: socket.user._id })
    })

  }) // ← connection block ends here

} // ← setupSocket ends here
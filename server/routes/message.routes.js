import express from 'express'
import Message from '../models/Message.js'
import protect from '../middleware/auth.middleware.js'
import { isMember } from '../middleware/auth.middleware.js'

const router = express.Router({ mergeParams: true })

router.use(protect)
router.use(isMember)

// Get message history for a channel
router.get('/:channelId/messages', async (req, res) => {
  try {
    const { channelId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = 50

    const messages = await Message.find({ channelId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    res.status(200).json({
      success: true,
      messages: messages.reverse()
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

export default router
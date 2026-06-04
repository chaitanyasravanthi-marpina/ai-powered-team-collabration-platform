import express from 'express'
import {
  createChannel,
  getChannels,
  getChannel,
  deleteChannel
} from '../controllers/channel.controller.js'
import protect from '../middleware/auth.middleware.js'
import { isMember, isAdmin } from '../middleware/auth.middleware.js'

const router = express.Router({ mergeParams: true })
// mergeParams: true allows access to params from parent router
// We need workspaceId from /api/workspaces/:workspaceId/channels

router.use(protect)
router.use(isMember)      // all channel routes require workspace membership

router.post('/', isAdmin, createChannel)     // only admins create
router.get('/', getChannels)                 // all members can view
router.get('/:channelId', getChannel)        // all members can view
router.delete('/:channelId', isAdmin, deleteChannel)  // only admins delete

export default router
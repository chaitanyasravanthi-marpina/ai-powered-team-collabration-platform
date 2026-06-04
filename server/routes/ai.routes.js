import express from 'express'
import { summarize, askAssistant } from '../controllers/ai.controller.js'
import protect from '../middleware/auth.middleware.js'
import { isMember } from '../middleware/auth.middleware.js'

const router = express.Router({ mergeParams: true })

router.use(protect)
router.use(isMember)

router.post('/summarize/:noteId', summarize)
router.post('/ask', askAssistant)

export default router
import express from 'express'
import {
  createWorkspace,
  joinWorkspace,
  getMyWorkspaces,
  getWorkspace,
  getWorkspaceMembers
} from '../controllers/workspace.controller.js'
import protect from '../middleware/auth.middleware.js'

const router = express.Router()

// All workspace routes require authentication
router.use(protect)

router.post('/', createWorkspace)
router.post('/join', joinWorkspace)
router.get('/', getMyWorkspaces)
router.get('/:id', getWorkspace)
router.get('/:id/members', getWorkspaceMembers)

export default router
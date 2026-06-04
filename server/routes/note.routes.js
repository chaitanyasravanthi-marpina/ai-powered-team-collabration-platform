import express from 'express'
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote
} from '../controllers/note.controller.js'
import protect from '../middleware/auth.middleware.js'
import { isMember } from '../middleware/auth.middleware.js'

const router = express.Router({ mergeParams: true })

router.use(protect)
router.use(isMember)

router.post('/', createNote)
router.get('/', getNotes)
router.get('/:noteId', getNote)
router.put('/:noteId', updateNote)
router.delete('/:noteId', deleteNote)

export default router
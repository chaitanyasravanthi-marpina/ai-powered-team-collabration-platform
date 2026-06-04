import Note from '../models/Note.js'
import WorkspaceMember from '../models/WorkspaceMember.js'

// ─── Create Note ──────────────────────────────────────────────
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body
    const { workspaceId } = req.params

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required'
      })
    }

    const note = await Note.create({
      title,
      content: content || {},
      workspaceId,
      createdBy: req.user._id,
      lastEditedBy: req.user._id
    })

    const populatedNote = await Note.findById(note._id)
      .populate('createdBy', 'name avatar')
      .populate('lastEditedBy', 'name avatar')

    res.status(201).json({
      success: true,
      note: populatedNote
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Get All Notes in Workspace ───────────────────────────────
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      workspaceId: req.params.workspaceId
    })
      .populate('createdBy', 'name avatar')
      .populate('lastEditedBy', 'name avatar')
      .sort({ updatedAt: -1 })

    res.status(200).json({
      success: true,
      notes
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Get Single Note ──────────────────────────────────────────
export const getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId)
      .populate('createdBy', 'name avatar')
      .populate('lastEditedBy', 'name avatar')

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    res.status(200).json({
      success: true,
      note
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Update Note ──────────────────────────────────────────────
export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body

    const note = await Note.findById(req.params.noteId)
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    // Update fields
    if (title) note.title = title
    if (content) note.content = content
    note.lastEditedBy = req.user._id

    await note.save()

    const updatedNote = await Note.findById(note._id)
      .populate('createdBy', 'name avatar')
      .populate('lastEditedBy', 'name avatar')

    res.status(200).json({
      success: true,
      note: updatedNote
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Delete Note ──────────────────────────────────────────────
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId)

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    // Check ownership — only creator or admin can delete
    const membership = await WorkspaceMember.findOne({
      workspaceId: note.workspaceId,
      userId: req.user._id
    })

    const isCreator = note.createdBy.toString() === req.user._id.toString()
    const isAdmin = membership?.role === 'admin'

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the note creator or admin can delete this note'
      })
    }

    await note.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
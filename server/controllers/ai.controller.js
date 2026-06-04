import Note from '../models/Note.js'
import { summarizeNote, askWorkspaceAssistant } from '../services/ai.service.js'

// ─── Summarize a Note ─────────────────────────────────────────
export const summarize = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId)

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    // Verify note belongs to this workspace
    if (note.workspaceId.toString() !== req.params.workspaceId) {
      return res.status(403).json({
        success: false,
        message: 'Note does not belong to this workspace'
      })
    }

    const summary = await summarizeNote(note.content, note.title)

    res.status(200).json({
      success: true,
      summary,
      noteTitle: note.title
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ─── Ask AI Assistant ─────────────────────────────────────────
export const askAssistant = async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question'
      })
    }

    // Fetch all notes in workspace
    const notes = await Note.find({
      workspaceId: req.params.workspaceId
    }).populate('createdBy', 'name')

    const answer = await askWorkspaceAssistant(question, notes)

    res.status(200).json({
      success: true,
      question,
      answer
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
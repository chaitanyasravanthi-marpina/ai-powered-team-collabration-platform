import { useEffect, useState, useRef,useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  setCurrentNote,
  summarizeNote,
  askAssistant,
  clearAiAnswer
} from '../../features/notes/notesSlice'

const NotesArea = ({ workspaceId }) => {
  const dispatch = useDispatch()
  const { notes, currentNote, summary, aiAnswer, loading, aiLoading } =
    useSelector(state => state.notes)

  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [question, setQuestion] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const saveTimeoutRef = useRef(null)

  useEffect(() => {
    dispatch(fetchNotes(workspaceId))
  }, [workspaceId, dispatch])

  

  // Load note into editor when user clicks a note
  
  const handleSave = useCallback(async () => {
    if (!currentNote) return
    await dispatch(updateNote({
      workspaceId,
      noteId: currentNote._id,
      noteData: { title: editTitle, content: editContent }
    }))
    setIsDirty(false)
  },[currentNote, editTitle, editContent, dispatch, workspaceId])
  const handleNoteSelect = (note) => {
    setEditTitle(note.title)
    setEditContent(note.content)
    setIsDirty(false)
    dispatch(setCurrentNote(note))
  }

  const handleCreateNote = async () => {
    const result = await dispatch(createNote({
      workspaceId,
      noteData: {
        title: 'Untitled Note',
        content: { ops: [{ insert: '\n' }] }
      }
    }))
    if (result.payload?.note) {
      handleNoteSelect(result.payload.note)
    }
  }
  // Auto save after 2 seconds of no typing
  useEffect(() => {
  if (!isDirty || !currentNote) return
  clearTimeout(saveTimeoutRef.current)
  saveTimeoutRef.current = setTimeout(() => {
    handleSave()
  }, 2000)
  return () => clearTimeout(saveTimeoutRef.current)
}, [editTitle, editContent, isDirty, currentNote, handleSave])


  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return
    dispatch(deleteNote({ workspaceId, noteId }))
  }

  const handleSummarize = () => {
    if (!currentNote) return
    dispatch(summarizeNote({
      workspaceId,
      noteId: currentNote._id
    }))
    setShowAiPanel(true)
  }

  const handleAskAssistant = (e) => {
  e.preventDefault()
  if (!question.trim()) return
  dispatch(askAssistant({ workspaceId, question }))
  setQuestion('')    // ← add this line
}

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex h-full">

      {/* Notes List — Left Panel */}
      <div className="w-64 border-r bg-gray-50 flex flex-col shrink-0">
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Notes</h3>
          <button
            onClick={handleCreateNote}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
          >
            + New
          </button>
        </div>

        {loading ? (
          <div className="p-4 text-gray-400 text-sm">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-400 text-sm mb-3">No notes yet</p>
            <button
              onClick={handleCreateNote}
              className="text-blue-600 text-sm hover:underline"
            >
              Create your first note
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {notes.map(note => (
              <div
                key={note._id}
                onClick={() => handleNoteSelect(note)}
                className={`p-4 border-b cursor-pointer hover:bg-white transition-colors group ${
                  currentNote?._id === note._id
                    ? 'bg-white border-l-2 border-l-blue-500'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {note.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(note.updatedAt)} · {note.createdBy?.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNote(note._id)
                    }}
                    className="text-red-400 hover:text-red-600 text-xs ml-2 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Assistant Button */}
        <div className="p-4 border-t">
          <button
            onClick={() => {
              setShowAiPanel(!showAiPanel)
              dispatch(clearAiAnswer())
            }}
            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700"
          >
            🤖 AI Assistant
          </button>
        </div>
      </div>

      {/* Editor — Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentNote ? (
          <>
            {/* Note Header */}
            <div className="px-6 py-4 border-b bg-white flex justify-between items-center shrink-0">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value)
                  setIsDirty(true)
                }}
                className="text-xl font-bold text-gray-800 flex-1 outline-none"
                placeholder="Note title..."
              />
              <div className="flex items-center gap-3">
                {isDirty && (
                  <span className="text-xs text-gray-400">
                    Saving...
                  </span>
                )}
                <button
                  onClick={handleSummarize}
                  disabled={aiLoading}
                  className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  {aiLoading ? '✨ Thinking...' : '✨ Summarize'}
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>

            {/* AI Summary Panel */}
            {summary && (
              <div className="mx-6 mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl shrink-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-semibold text-purple-700">
                    ✨ AI Summary
                  </h4>
                  <button
                    onClick={() => dispatch(setCurrentNote(currentNote))}
                    className="text-purple-400 hover:text-purple-600 text-xs"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-purple-800 leading-relaxed">
                  {summary}
                </p>
              </div>
            )}

            {/* Quill Editor */}
            <div className="flex-1 overflow-y-auto">
              <ReactQuill
                theme="snow"
                value={editContent}
                onChange={(value) => {
                  setEditContent(value)
                  setIsDirty(true)
                }}
                style={{ height: 'calc(100% - 42px)' }}
                placeholder="Start writing..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">Select a note to edit</p>
              <p className="text-sm">or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Panel */}
      {showAiPanel && (
        <div className="w-80 border-l bg-gray-50 flex flex-col shrink-0">
          <div className="p-4 border-b bg-white flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">🤖 AI Assistant</h3>
            <button
              onClick={() => setShowAiPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {aiAnswer ? (
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold mb-2">
                  AI Answer
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {aiAnswer}
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-8">
                <p className="text-sm">
                  Ask anything about your workspace notes
                </p>
              </div>
            )}

            {aiLoading && (
              <div className="text-center text-purple-500 mt-4">
                <p className="text-sm">✨ Thinking...</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <form onSubmit={handleAskAssistant}>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ask about your notes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
              />
              <button
                type="submit"
                disabled={aiLoading || !question.trim()}
                className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                Ask AI
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesArea
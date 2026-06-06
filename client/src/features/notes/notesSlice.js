import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchNotes = createAsyncThunk(
  'notes/fetchAll',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/workspaces/${workspaceId}/notes`)
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const createNote = createAsyncThunk(
  'notes/create',
  async ({ workspaceId, noteData }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/workspaces/${workspaceId}/notes`,
        noteData
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const updateNote = createAsyncThunk(
  'notes/update',
  async ({ workspaceId, noteId, noteData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/workspaces/${workspaceId}/notes/${noteId}`,
        noteData
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const deleteNote = createAsyncThunk(
  'notes/delete',
  async ({ workspaceId, noteId }, { rejectWithValue }) => {
    try {
      await api.delete(`/workspaces/${workspaceId}/notes/${noteId}`)
      return noteId
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const summarizeNote = createAsyncThunk(
  'notes/summarize',
  async ({ workspaceId, noteId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/workspaces/${workspaceId}/ai/summarize/${noteId}`
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const askAssistant = createAsyncThunk(
  'notes/askAssistant',
  async ({ workspaceId, question }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/workspaces/${workspaceId}/ai/ask`,
        { question }
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    notes: [],
    currentNote: null,
    summary: null,
    aiAnswer: null,
    loading: false,
    aiLoading: false,
    error: null
  },
  reducers: {
    setCurrentNote: (state, action) => {
      state.currentNote = action.payload
      state.summary = null
    },
    clearAiAnswer: (state) => {
      state.aiAnswer = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false
        state.notes = action.payload.notes
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload.note)
        state.currentNote = action.payload.note
      })

      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(
          n => n._id === action.payload.note._id
        )
        if (index !== -1) {
          state.notes[index] = action.payload.note
        }
        state.currentNote = action.payload.note
      })

      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(n => n._id !== action.payload)
        state.currentNote = null
      })

      .addCase(summarizeNote.pending, (state) => {
        state.aiLoading = true
        state.summary = null
      })
      .addCase(summarizeNote.fulfilled, (state, action) => {
        state.aiLoading = false
        state.summary = action.payload.summary
      })
      .addCase(summarizeNote.rejected, (state, action) => {
        state.aiLoading = false
        state.error = action.payload
      })

      .addCase(askAssistant.pending, (state) => {
        state.aiLoading = true
        state.aiAnswer = null
      })
      .addCase(askAssistant.fulfilled, (state, action) => {
        state.aiLoading = false
        state.aiAnswer = action.payload.answer
      })
      .addCase(askAssistant.rejected, (state) => {
        state.aiLoading = false
      })
  }
})

export const { setCurrentNote, clearAiAnswer } = notesSlice.actions
export default notesSlice.reducer
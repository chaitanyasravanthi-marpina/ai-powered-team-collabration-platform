import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/workspaces')
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const createWorkspace = createAsyncThunk(
  'workspace/create',
  async (workspaceData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/workspaces', workspaceData)
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const joinWorkspace = createAsyncThunk(
  'workspace/join',
  async (inviteCode, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/workspaces/join', { inviteCode })
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)
export const deleteWorkspaceAction = createAsyncThunk(
  'workspace/delete',
  async (workspaceId, { rejectWithValue }) => {
    try {
      await api.delete(`/workspaces/${workspaceId}`)
      return workspaceId
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload
    },
    clearWorkspaceError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false
        state.workspaces = action.payload.workspaces
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces.push({
          ...action.payload.workspace,
          role: 'admin'
        })
      })
      .addCase(joinWorkspace.fulfilled, (state, action) => {
        state.workspaces.push({
          ...action.payload.workspace,
          role: 'member'
        })
      })
      .addCase(deleteWorkspaceAction.fulfilled, (state, action) => {
  state.workspaces = state.workspaces.filter(
    w => w._id !== action.payload
  )
})
  }
})

export const { setCurrentWorkspace, clearWorkspaceError } = workspaceSlice.actions
export default workspaceSlice.reducer
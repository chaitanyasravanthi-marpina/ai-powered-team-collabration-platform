import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchMembers = createAsyncThunk(
  'members/fetchAll',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/workspaces/${workspaceId}/members`)
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

const membersSlice = createSlice({
  name: 'members',
  initialState: {
    members: [],
    loading: false
  },
  reducers: {
    setUserOnline: (state, action) => {
      const member = state.members.find(
        m => m.userId._id === action.payload.userId
      )
      if (member) member.userId.isOnline = true
    },
    setUserOffline: (state, action) => {
      const member = state.members.find(
        m => m.userId._id === action.payload.userId
      )
      if (member) member.userId.isOnline = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false
        state.members = action.payload.members
      })
  }
})

export const { setUserOnline, setUserOffline } = membersSlice.actions
export default membersSlice.reducer
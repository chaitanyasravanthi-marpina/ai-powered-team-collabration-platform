import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchChannels = createAsyncThunk(
  'channel/fetchAll',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/workspaces/${workspaceId}/channels`)
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const createChannel = createAsyncThunk(
  'channel/create',
  async ({ workspaceId, channelData }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/workspaces/${workspaceId}/channels`,
        channelData
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

const channelSlice = createSlice({
  name: 'channel',
  initialState: {
    channels: [],
    currentChannel: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentChannel: (state, action) => {
      state.currentChannel = action.payload
    },
    clearChannels: (state) => {
      state.channels = []
      state.currentChannel = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false
        state.channels = action.payload.channels
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        state.channels.push(action.payload.channel)
      })
  }
})

export const { setCurrentChannel, clearChannels } = channelSlice.actions
export default channelSlice.reducer
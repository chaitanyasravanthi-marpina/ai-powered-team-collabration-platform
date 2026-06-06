import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData)
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', userData)
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me')
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    initialized: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
      })

    .addCase(getMe.fulfilled, (state, action) => {
  state.user = action.payload.user
  state.token = action.payload.token    // ← add this line
  state.initialized = true
})
      .addCase(getMe.rejected, (state) => {
        state.user = null
        state.initialized = true
      })
  }
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
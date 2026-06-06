import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import workspaceReducer from '../features/workspace/workspaceSlice'
import channelReducer from '../features/channel/channelSlice'
import membersReducer from '../features/members/membersSlice'
import notesReducer from '../features/notes/notesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    channel: channelReducer,
    members: membersReducer,
    notes: notesReducer,
  },
})

export default store
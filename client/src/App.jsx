import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getMe } from './features/auth/authSlice'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import WorkspacePage from './pages/workspace/WorkspacePage'

const ProtectedRoute = ({ children }) => {
  const { user, initialized } = useSelector(state => state.auth)

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const dispatch = useDispatch()

 useEffect(() => {
  const token = localStorage.getItem("socketToken")
  if (token) {
    dispatch(getMe())
  } else {
    // mark initialization complete if no token
    dispatch({ type: "auth/getMe/rejected" })
  }
}, [dispatch])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/workspace/:workspaceId" element={
        <ProtectedRoute>
          <WorkspacePage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
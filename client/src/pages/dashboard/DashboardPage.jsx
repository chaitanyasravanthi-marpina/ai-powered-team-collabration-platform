import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../features/auth/authSlice'
import {
  fetchWorkspaces,
  createWorkspace,
  joinWorkspace,
  clearWorkspaceError
} from '../../features/workspace/workspaceSlice'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { workspaces, loading, error } = useSelector(state => state.workspace)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => {
    dispatch(fetchWorkspaces())
  }, [dispatch])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    const result = await dispatch(createWorkspace(createForm))
    if (!result.error) {
      setShowCreateModal(false)
      setCreateForm({ name: '', description: '' })
    }
  }

  const handleJoinWorkspace = async (e) => {
    e.preventDefault()
    const result = await dispatch(joinWorkspace(inviteCode))
    if (!result.error) {
      setShowJoinModal(false)
      setInviteCode('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TeamCollab</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto mt-10 px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.name}! 👋
            </h2>
            <p className="text-gray-500 mt-1">
              Select a workspace to get started
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium"
            >
              Join Workspace
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              + Create Workspace
            </button>
          </div>
        </div>

    {/* Error */}
{error && (
  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex justify-between items-center">
    <span>{error}</span>
    <button
      onClick={() => dispatch(clearWorkspaceError())}
      className="text-red-400 hover:text-red-600 ml-4 font-bold"
    >
      ✕
    </button>
  </div>
)}

        {/* Workspace Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading workspaces...
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              You don't have any workspaces yet
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create your first workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map(workspace => (
              <div
                key={workspace._id}
                onClick={() => navigate(`/workspace/${workspace._id}`)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md cursor-pointer border border-gray-100 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {workspace.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    workspace.role === 'admin'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {workspace.role}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {workspace.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {workspace.description || 'No description'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Create Workspace
            </h3>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm({
                    ...createForm, name: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Team"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={e => setCreateForm({
                    ...createForm, description: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is this workspace for?"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Workspace Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Join Workspace
            </h3>
            <form onSubmit={handleJoinWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter invite code"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
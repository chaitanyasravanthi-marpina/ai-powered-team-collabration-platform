import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchChannels,
  createChannel,
  setCurrentChannel
} from '../../features/channel/channelSlice'
import {
  fetchMembers,
  setUserOnline,
  setUserOffline
} from '../../features/members/membersSlice'
import ChatArea from '../../components/channel/ChatArea'
import NotesArea from '../../components/notes/NotesArea'
import api from '../../services/api'
import { getSocket } from '../../socket/socket'

const WorkspacePage = () => {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, token } = useSelector(state => state.auth)
  const { channels, currentChannel } = useSelector(state => state.channel)
  const { workspaces } = useSelector(state => state.workspace)
  const { members } = useSelector(state => state.members)

  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [activeTab, setActiveTab] = useState('chat')

  const workspace = useMemo(() =>
    workspaces.find(w => w._id === workspaceId) || null
  , [workspaces, workspaceId])

  const userRole = workspace?.role || 'member'

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchChannels(workspaceId))
      dispatch(fetchMembers(workspaceId))
    }
  }, [workspaceId, dispatch])

  useEffect(() => {
    if (channels.length > 0 && !currentChannel) {
      dispatch(setCurrentChannel(channels[0]))
    }
  }, [channels, currentChannel, dispatch])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.on('user-online', (data) => {
      dispatch(setUserOnline(data))
    })

    socket.on('user-offline', (data) => {
      dispatch(setUserOffline(data))
    })

    return () => {
      socket.off('user-online')
      socket.off('user-offline')
    }
  }, [dispatch])

  const handleCreateChannel = async (e) => {
    e.preventDefault()
    const result = await dispatch(createChannel({
      workspaceId,
      channelData: { name: channelName }
    }))
    if (!result.error) {
      setShowCreateChannel(false)
      setChannelName('')
    }
  }

  const handleDeleteChannel = async (channelId, name) => {
    if (!window.confirm(`Delete "#${name}"? All messages will be lost.`)) return
    try {
      await api.delete(`/workspaces/${workspaceId}/channels/${channelId}`)
      dispatch(fetchChannels(workspaceId))
      if (currentChannel?._id === channelId) {
        dispatch(setCurrentChannel(null))
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete channel')
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Back
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="font-semibold text-gray-800">
            {workspace?.name || 'Loading...'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            userRole === 'admin'
              ? 'bg-purple-100 text-purple-600'
              : 'bg-green-100 text-green-600'
          }`}>
            {userRole}
          </span>
          <span className="text-sm text-gray-600">{user?.name}</span>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-gray-800 flex flex-col shrink-0">
          <div className="p-4 overflow-y-auto flex-1">

            {/* Channels Section */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Channels
              </span>
              {userRole === 'admin' && (
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="text-gray-400 hover:text-white text-lg leading-none"
                >
                  +
                </button>
              )}
            </div>

            {channels.length === 0 ? (
              <p className="text-gray-500 text-xs mb-4">No channels yet</p>
            ) : (
              <div className="space-y-1 mb-6">
                {channels.map(channel => (
                  <div
                    key={channel._id}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentChannel?._id === channel._id
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <button
                      onClick={() => {
                        dispatch(setCurrentChannel(channel))
                        setActiveTab('chat')
                      }}
                      className="flex-1 text-left"
                    >
                      # {channel.name}
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDeleteChannel(channel._id, channel.name)}
                        className="text-red-400 hover:text-red-300 text-xs ml-2 opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Members Section */}
            <div className="mb-3">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Members — {members.length}
              </span>
            </div>

            <div className="space-y-2">
              {members.map(member => (
                <div
                  key={member._id}
                  className="flex items-center gap-2 px-2 py-1"
                >
                  <div className="relative">
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {member.userId?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-800 ${
                      member.userId?.isOnline ? 'bg-green-400' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${
                      member.userId?.isOnline ? 'text-white' : 'text-gray-500'
                    }`}>
                      {member.userId?.name}
                      {member.userId?._id === user?._id && ' (you)'}
                    </p>
                  </div>
                  {member.role === 'admin' && (
                    <span className="text-purple-400 text-xs">admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom user info */}
          <div className="p-4 border-t border-gray-700 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium truncate">
                  {user?.name}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-400 text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Tab Buttons */}
          <div className="bg-white border-b px-6 flex gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Notes
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' ? (
            currentChannel ? (
              <ChatArea
                channel={currentChannel}
                workspaceId={workspaceId}
                token={token}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                {channels.length === 0
                  ? 'No channels yet. Create one to get started.'
                  : 'Select a channel to start chatting'
                }
              </div>
            )
          ) : (
            <NotesArea workspaceId={workspaceId} />
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Create Channel
            </h3>
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="text-gray-400 mr-1">#</span>
                  <input
                    type="text"
                    value={channelName}
                    onChange={e => setChannelName(e.target.value)}
                    className="flex-1 outline-none text-sm"
                    placeholder="general"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkspacePage
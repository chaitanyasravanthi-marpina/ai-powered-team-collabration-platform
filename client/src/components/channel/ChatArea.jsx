import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { connectSocket, getSocket } from '../../socket/socket'


const ChatArea = ({ channel, workspaceId }) => {
  const { user } = useSelector(state => state.auth)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Connect socket and join channel
  useEffect(() => {
    // Get token from login response
    // We stored it in localStorage temporarily for socket
    const token = localStorage.getItem('socketToken')
    const socket = connectSocket(token)

    // Join channel room
    socket.emit('join-channel', channel._id)

    // Receive previous messages
    socket.on('previous-messages', (msgs) => {
      setMessages(msgs)
    })

    // Receive new messages
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    // Typing indicators
    socket.on('user-typing', (data) => {
      setIsTyping(data.name)
    })

    socket.on('user-stop-typing', () => {
      setIsTyping(null)
    })

    return () => {
      socket.off('previous-messages')
      socket.off('new-message')
      socket.off('user-typing')
      socket.off('user-stop-typing')
    }
  }, [channel._id])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const socket = getSocket()
    socket.emit('send-message', {
      channelId: channel._id,
      workspaceId,
      content: newMessage
    })

    setNewMessage('')
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)

    const socket = getSocket()
    socket.emit('typing', channel._id)

    // Stop typing after 2 seconds of no input
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', channel._id)
    }, 2000)
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="px-6 py-4 border-b bg-white shrink-0">
        <h2 className="font-semibold text-gray-800">
          # {channel.name}
        </h2>
        {channel.description && (
          <p className="text-gray-400 text-sm mt-1">
            {channel.description}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-lg mb-1">Welcome to #{channel.name}!</p>
            <p className="text-sm">Send the first message</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender?._id === user?._id
            const showAvatar = index === 0 ||
              messages[index - 1]?.sender?._id !== message.sender?._id

            return (
              <div key={message._id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {showAvatar ? (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {message.sender?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="w-8 shrink-0" />
                )}

                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showAvatar && (
                    <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm font-medium text-gray-700">
                        {isOwn ? 'You' : message.sender?.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={`px-4 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
            </div>
            <span>{isTyping} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={`Message #${channel.name}`}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatArea
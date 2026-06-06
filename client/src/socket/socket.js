import { io } from 'socket.io-client'

let socket = null
let currentToken = null

export const connectSocket = (token) => {
  if (socket && currentToken !== token) {
    socket.disconnect()
    socket = null
    currentToken = null
  }

  if (socket?.connected && currentToken === token) {
    return socket
  }

  currentToken = token
 const serverURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

socket = io(serverURL, {
    auth: { token },
    withCredentials: true
  })

  socket.on('connect', () => {
    console.log('Socket connected')
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    currentToken = null
  }
}
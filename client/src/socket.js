import io from 'socket.io-client'

const SOCKET_URL = 'http://172.16.48.238:3001'

const socket = io(import.meta.env.VITE_SERVER_URL || SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
})

export default socket

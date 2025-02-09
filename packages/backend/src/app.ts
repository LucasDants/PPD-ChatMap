import { createServer } from 'http';
import { Server } from 'socket.io';
import { Message } from '../../web/src/store';
import { BackendUser } from './database';


interface ServerToClientEvents {
  userPositionChanged: (user: BackendUser) => void
  initialUsers: (users: BackendUser[]) => void
  userDisconnected: (userId: string) => void
  message: (message: Message) => void
}

interface ClientToServerEvents {
  changePosition: (position: { lat: number, lng: number }) => void
  message: (message: Message) => void
}


interface InterServerEvents {
}

interface SocketData {
  username: string
  position: {
    lat: number
    lng: number
  }
}

export const app = createServer()

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(app, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173']
  },
})
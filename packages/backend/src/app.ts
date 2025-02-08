import { createServer } from 'http';
import { Server } from 'socket.io';

export type Alert = {
  deviceId: number
  deviceName: number
  measure: number
  measureType: string
  date: Date
}

interface ServerToClientEvents {
  alert: (alert: Alert) => void
}

interface ClientToServerEvents {
  alert: (alert: Alert) => void
}

interface InterServerEvents {
}

interface SocketData {
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
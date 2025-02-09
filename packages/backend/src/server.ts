import { app, io } from "./app";
import { calculateUsersDistance, getUsers, setUser } from "./database";

// mqConnectionPublisher.connect()
// mqConnectionSubscriber.connect()

// io.use(async (_, next) => {
//   await mqConnectionPublisher.connect()
//   await mqConnectionSubscriber.connect()

//   return next()
// })

io.use((socket, next) => {
  const position: { lat: number, lng: number } = socket.handshake.auth.position
  const username: string = socket.handshake.auth.username

  try {
    if (typeof position.lat !== "number" || typeof position.lng !== "number") {
      throw new Error("Invalid position")
    }

    socket.data.position = position
    socket.data.username = username

    setUser({ id: socket.id, username, position })

    return next()
  } catch (err) {
    return next(err as Error)
  }
})


io.on('connection', socket => {
  socket.broadcast.emit("userPositionChanged", {
    id: socket.id,
    username: socket.data.username,
    position: socket.data.position
  })

  socket.emit("initialUsers", getUsers(socket.id))

  // listeners
  socket.on('message', (message) => {
    const distance = calculateUsersDistance(message.from, message.to)

    if (distance == null) {
      return
    }

    if (distance > 200) {
      //TODO ADD QUEUE
      return
    }

    socket.to(message.to).emit('message', message)
  })

  socket.on("changePosition", (position: { lat: number, lng: number }) => {
    socket.data.position = position

    setUser({ id: socket.id, username: socket.data.username, position })

    socket.broadcast.emit("userPositionChanged", {
      id: socket.id,
      username: socket.data.username,
      position: position
    })
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit("userDisconnected", socket.id)
  })
})

app.listen({ port: 3333, host: '0.0.0.0' }, () => console.log("🚀 Server is running on port 3333"))
import { Chat } from '@/components/chat'
import { MapComponent } from '@/components/map'
import { socket } from '@/services/socket'
import { meAtom, store, User, usersAtom } from '@/store'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

export default function Map() {
  const setMe = useSetAtom(meAtom)
  const setUsers = useSetAtom(usersAtom)
  const [searchParams, setSearchParams] = useSearchParams()
  const username = searchParams.get("username")

  useEffect(() => {
    const me = store.get(meAtom)
    const newUsername = username ?? `Traveler${Math.floor(Math.random() * 1000)}`

    setSearchParams({
      username: newUsername
    })

    socket.auth = { position: me.position, username }
    socket.connect()

    socket.on("connect", () => {
      setMe(prev => ({ ...prev, id: socket.id as string, username: newUsername }))
    })


    socket.on("initialUsers", (users) => {
      setUsers(users.map((user: Partial<User>) => {
        if (user.messages == null) {
          return {
            ...user,
            messages: []
          }
        }

        return user
      }))
    })

    socket.on("userPositionChanged", (data) => {
      const newUser: User = {
        id: data.id,
        username: data.username,
        position: data.position,
        messages: [],
      }

      setUsers(prev => {
        const index = prev.findIndex(u => u.id === newUser.id)

        if (index === -1) {
          return [...prev, newUser]
        }

        const prevUser = prev[index]

        prevUser.position = newUser.position

        return [...prev]
      })
    })

    socket.on("userDisconnected", userId => {
      console.log("userDisconnected", userId)
      setUsers(prev => prev.filter(user => user.id !== userId))
    })

    socket.on("connect_error", (err) => {
      alert("Error connecting to the server " + err?.message)
    })

    return () => {
      socket.off("connect")
      socket.off("initialUsers")
      socket.off("userPositionChanged")
      socket.off("userDisconnected")
      socket.off("connect_error")
    }
  }, [setMe])

  return (
    <div className="flex flex-1 h-screen justify-center">
      <Chat />
      <MapComponent />
    </div>

  )
}
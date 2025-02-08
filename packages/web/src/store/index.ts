import { atom } from "jotai";

type User = {
  id: "",
  username: string
  position: {
    lat: number
    lng: number
  }
  hasNewMessages: boolean
  messages: {
    id: string
    userId: string
    content: string
    status: "sent" | "received" | "delivered" | "read"
    createdAt: string
  }[]
}

export const meAtom = atom({ 
  id: "",
  username: "",
  position: {
    lat: -3.743929,
    lng: -38.535804
  },
  activeChatUserId: ""
})

export const usersAtom = atom<User[]>([])
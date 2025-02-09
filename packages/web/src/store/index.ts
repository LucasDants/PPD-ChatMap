import { atom, createStore } from "jotai";

export type Message = {
  id: string
  from: string
  to: string
  content: string
  createdAt: string
}

export type User = {
  id: string,
  username: string
  position: {
    lat: number
    lng: number
  }
  messages: Message[]
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

export const store = createStore()

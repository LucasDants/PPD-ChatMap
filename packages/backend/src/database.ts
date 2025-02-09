

import { User } from '../../web/src/store'
import { haversineDistance } from '../../web/src/utils'


export type BackendUser = Omit<User, "messages" | "hasNewMessages">

export const users: Omit<BackendUser, "messages" | "hasNewMessages">[] = []

export function getUsers(userId: string) {
  return users.filter(u => u.id !== userId)
}

export function setUser(user: BackendUser) {
  const index = users.findIndex(u => u.id === user.id)

  if (index === -1) {
    users.push(user)
    return
  }

  const prevUser = users[index]

  users[index] = { ...prevUser, ...user }
}

export function deleteUser(id: string) {
  const index = users.findIndex(u => u.id === id)

  if (index === -1) {
    return
  }

  users.splice(index, 1)

  return users
}

export function getNearbyUsers(userId: string, position: { lat: number, lng: number }) {
  const nearbyUsers = users.filter(u => {
    if (u.id === userId) {
      return false
    }

    const distance = haversineDistance(position, u.position)

    return distance <= 200
  })

  return nearbyUsers
}

export function calculateUsersDistance(userId1: string, userId2: string) {
  const user1 = users.find(u => u.id === userId1)
  const user2 = users.find(u => u.id === userId2)
  if (user1 == null || user2 == null) {
    return null
  }

  const distance = haversineDistance(user1?.position, user2?.position)

  return distance
}
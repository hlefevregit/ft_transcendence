// Class regroupé ici pour la simplicité entre components

export interface ChatUser {
  id: number
  username: string
  trophies: number
}

export interface Message {
  id: number
  content: string
  senderId: number
  receiverId: number
  createdAt: string
}

export interface Invitation {
  id: number
  fromId: number
  toId: number
  game: string
  createdAt: string
}

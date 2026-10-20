export type AnnouncementTone = 'polite' | 'assertive'

export interface Announcement {
  id: number
  message: string
  tone: AnnouncementTone
}

type Listener = () => void

let current: Announcement | null = null
let sequence = 0
const listeners = new Set<Listener>()

export function announce(message: string, tone: AnnouncementTone = 'polite') {
  sequence += 1
  current = { id: sequence, message, tone }
  listeners.forEach((listener) => listener())
}

export function subscribeAnnouncements(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getAnnouncement() {
  return current
}

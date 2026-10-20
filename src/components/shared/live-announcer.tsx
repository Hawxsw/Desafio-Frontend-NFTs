import { useSyncExternalStore } from 'react'
import { getAnnouncement, subscribeAnnouncements } from '@/lib/announcer'

export function LiveAnnouncer() {
  const announcement = useSyncExternalStore(subscribeAnnouncements, getAnnouncement)

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement?.tone === 'polite' ? announcement.message : ''}
      </div>
      <div role="alert" aria-live="assertive" className="sr-only">
        {announcement?.tone === 'assertive' ? announcement.message : ''}
      </div>
    </>
  )
}

import { Chat } from '@/components/chat'
import { MapComponent } from '@/components/map'

export default function Map() {
  return (
    <div className="flex flex-1 h-screen justify-center">
      <Chat />
      <MapComponent />
    </div>

  )
}
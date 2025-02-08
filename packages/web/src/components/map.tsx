import { meAtom, usersAtom } from '@/store'
import { haversineDistance } from '@/utils'
import { useAtom } from 'jotai'
import { Icon, Marker as LMarker } from 'leaflet'
import { useMemo, useRef } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet'
import pinLocationChat from '../assets/pin-chat.svg'
import pinLocationMe from '../assets/pin-location-me.svg'
import pinLocationWrong from '../assets/pin-location-wrong.svg'
import { default as pinChatUnread, default as pinLocationUser } from '../assets/pin-location.svg'

const markerIcon = {
  me: new Icon({ iconUrl: pinLocationMe, iconSize: [60, 60], tooltipAnchor: [0, -28] }),
  user: new Icon({ iconUrl: pinLocationUser, iconSize: [60, 60], tooltipAnchor: [0, -28] }),
  far: new Icon({ iconUrl: pinLocationWrong, iconSize: [60, 60], tooltipAnchor: [0, -28] }),
  chat: new Icon({ iconUrl: pinLocationChat, iconSize: [60, 60], tooltipAnchor: [0, -28] }),
  chat_unread: new Icon({ iconUrl: pinChatUnread, iconSize: [60, 60], tooltipAnchor: [0, -28] }),
}

export function MapComponent() {
  const [me, setMe] = useAtom(meAtom)
  const [users] = useAtom(usersAtom)

  const markerRef = useRef<LMarker>(null)

  const meMarkerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current

        if (marker != null) {
          setMe(prev => ({ ...prev, position: marker.getLatLng() }))
        }

        // TODO: Send socket event to update position
      },
    }),
    [setMe],
  )

  return (
    <MapContainer center={me.position} className='h-screen w-full' zoom={13} scrollWheelZoom={true} >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker draggable position={me.position} eventHandlers={meMarkerEventHandlers} icon={markerIcon.me} ref={markerRef} >
        <Tooltip direction='top'>{me.username}</Tooltip>
      </Marker>

      {users.map(user => {
        const distanceFromMe = haversineDistance(me.position, user.position)

        let icon = markerIcon.user


        if (user.id === me.activeChatUserId) {
          icon = user.hasNewMessages ? markerIcon.chat_unread : markerIcon.chat
        }

        if (distanceFromMe > 200) {
          icon = markerIcon.far
        }

        return (
          <Marker
            key={user.id}
            position={user.position}
            icon={icon}
            eventHandlers={{
              click: () => setMe(prev => ({ ...prev, activeChatUserId: user.id }))
            }}>
            <Tooltip direction='top'>{user.username}</Tooltip>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
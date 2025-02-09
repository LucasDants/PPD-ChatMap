import { socket } from '@/services/socket'
import { meAtom, usersAtom } from '@/store'
import { haversineDistance } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { Icon, Marker as LMarker } from 'leaflet'
import { useMemo, useRef } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet'

import pinLocationMe from '../assets/pin-location-me.svg'
import pinLocationWrong from '../assets/pin-location-wrong.svg'
import pinLocationUser from '../assets/pin-location.svg'

const markerIcon = {
  me: new Icon({ iconUrl: pinLocationMe, iconSize: [60, 60], tooltipAnchor: [0, -28] }),
  user: new Icon({ iconUrl: pinLocationUser, iconSize: [60, 60], tooltipAnchor: [0, -28] }),
  far: new Icon({ iconUrl: pinLocationWrong, iconSize: [60, 60], tooltipAnchor: [0, -28] }),
}

export function MapComponent() {
  const [me, setMe] = useAtom(meAtom)
  const users = useAtomValue(usersAtom)

  const markerRef = useRef<LMarker>(null)

  const meMarkerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current

        if (marker != null) {
          const latLng = marker?.getLatLng()
          setMe(prev => ({ ...prev, position: latLng }))
          socket.emit("changePosition", latLng)
        }
      },
    }),
    [setMe],
  )

  return (
    <MapContainer center={me.position} className='h-screen w-full' zoom={18} scrollWheelZoom={true} >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {users.map(user => {
        const distanceFromMe = haversineDistance(me.position, user.position)

        let icon = markerIcon.user

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
            <Tooltip direction='top' permanent>{user.username}</Tooltip>
          </Marker>
        )
      })}
      <Marker zIndexOffset={10} draggable position={me.position} eventHandlers={meMarkerEventHandlers} icon={markerIcon.me} ref={markerRef}>
        <Tooltip direction='top'>{me.username}</Tooltip>
      </Marker>
    </MapContainer>
  )
}
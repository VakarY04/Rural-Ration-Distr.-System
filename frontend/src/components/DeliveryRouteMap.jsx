import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Small colored teardrop pin rendered with a divIcon, so no external marker
// image assets are needed (avoids the classic Leaflet + bundler icon bug).
const pin = (label, color) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 30px; height: 30px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 8px rgba(15, 23, 42, 0.35);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white; font-weight: 800; font-size: 12px;
          font-family: 'Inter', system-ui, sans-serif;
        ">${label}</span>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

export default function DeliveryRouteMap({ origin, destination }) {
  const bounds = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [36, 36] }}
      scrollWheelZoom={false}
      dragging={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[origin.lat, origin.lng]} icon={pin('A', '#B45309')}>
        <Popup>
          <strong>{origin.label}</strong>
          <br />
          {origin.address}
        </Popup>
      </Marker>

      <Marker position={[destination.lat, destination.lng]} icon={pin('B', '#047857')}>
        <Popup>
          <strong>{destination.label}</strong>
        </Popup>
      </Marker>

      <Polyline
        positions={bounds}
        pathOptions={{ color: '#1D4ED8', weight: 4, dashArray: '2 10', lineCap: 'round' }}
      />
    </MapContainer>
  );
}

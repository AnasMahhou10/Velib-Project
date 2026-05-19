'use client';

import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

export type MapStation = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

const defaultIcon = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

type StationsMapProps = {
  center: [number, number];
  zoom: number;
  markers: MapStation[];
  mode: 'start' | 'end';
  onSelectStation: (station: MapStation) => void;
};

export default function StationsMap({
  center,
  zoom,
  markers,
  mode,
  onSelectStation,
}: StationsMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((station) => (
        <Marker key={station.id} position={[station.lat, station.lng]}>
          <Popup>
            <div className="space-y-2">
              <div className="font-semibold text-sm text-zinc-900">
                {station.name}
              </div>
              <button
                type="button"
                className="w-full rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-sky-950 shadow hover:bg-sky-400"
                onClick={() => onSelectStation(station)}
              >
                {mode === 'start'
                  ? 'Choisir comme départ'
                  : "Choisir comme arrivée"}
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

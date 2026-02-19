'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
  selectedLocation?: { lat: number; lng: number } | null;
  height?: string;
}

function LocationMarker({ 
  onLocationSelect, 
  selectedLocation 
}: { 
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null
  );

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // Update position when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      const newPos: [number, number] = [selectedLocation.lat, selectedLocation.lng];
      setPosition(newPos);
      map.flyTo(newPos, 13);
    }
  }, [selectedLocation, map]);

  return position === null ? null : <Marker position={position} />;
}

export default function LocationMap({ 
  onLocationSelect, 
  initialPosition = [-8.4095, 115.1889], 
  selectedLocation,
  height = '200px' 
}: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div 
        className="w-full rounded-input overflow-hidden relative shadow-inner bg-slate-200 animate-pulse"
        style={{ height }}
      />
    );
  }

  return (
    <div className="w-full rounded-input overflow-hidden relative shadow-inner group" style={{ height }}>
      <MapContainer
        center={initialPosition}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          onLocationSelect={onLocationSelect} 
          selectedLocation={selectedLocation}
        />
      </MapContainer>
      
      {/* Map Overlay Text */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-[#059467] shadow-sm flex items-center gap-1 pointer-events-none z-[1000]">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Click to select location
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

interface Trip {
  id: string;
  title: string;
  location: string;
  dates: string;
  image: string;
  tags: string[];
  lat: number;
  lng: number;
  rating?: number;
  active?: boolean;
}

interface TripMapProps {
  trips: Trip[];
  selectedTripId: string | null;
}

export default function TripMap({ trips, selectedTripId }: TripMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add markers for each trip
    trips.forEach((trip) => {
      const isSelected = trip.id === selectedTripId;

      // Create custom icon
      const iconHtml = `
        <div class="relative flex items-center justify-center transform transition-transform ${
          isSelected ? 'scale-125' : 'hover:scale-110'
        }">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="${
            isSelected ? '#059467' : 'rgba(5, 148, 103, 0.8)'
          }" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-lg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          ${
            isSelected
              ? `<div class="absolute w-4 h-4 bg-[#059467] rounded-full animate-ping top-[28px]"></div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
      });

      const marker = L.marker([trip.lat, trip.lng], { icon: customIcon }).addTo(
        mapRef.current!
      );

      // Create popup content
      const popupContent = `
        <div class="w-[240px]">
          <div class="h-[120px] w-full bg-cover bg-center relative rounded-t-xl" style="background-image: url('${
            trip.image
          }')">
            ${
              trip.rating
                ? `<div class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-[#0f231d]">${trip.rating} ★</div>`
                : ''
            }
          </div>
          <div class="p-4 bg-white">
            <h3 class="text-[#0f231d] text-lg font-bold leading-tight">${trip.title}</h3>
            <p class="text-gray-500 text-xs mt-1 font-medium">${trip.dates}</p>
            <a href="/trips/${
              trip.id
            }" class="flex items-center gap-1 mt-3 text-[#059467] text-sm font-bold hover:underline">
              View Details 
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 240,
        className: 'custom-popup',
      });

      // Show popup if selected
      if (isSelected) {
        marker.openPopup();
      }

      markersRef.current[trip.id] = marker;
    });

    // Fit bounds to show all markers
    if (trips.length > 0) {
      const bounds = L.latLngBounds(trips.map((trip) => [trip.lat, trip.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [trips, selectedTripId]);

  // Pan to selected trip
  useEffect(() => {
    if (!mapRef.current || !selectedTripId) return;

    const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
    if (selectedTrip) {
      mapRef.current.setView([selectedTrip.lat, selectedTrip.lng], 8, {
        animate: true,
      });
      markersRef.current[selectedTripId]?.openPopup();
    }
  }, [selectedTripId, trips]);

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full" />
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: 240px !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}

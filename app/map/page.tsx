'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import { tripAPI, userAPI, matchAPI } from '../../services/api';
import { MapPin, Search, Plus, Minus, Navigation, Layers, Loader2, ChevronUp, ChevronDown } from 'lucide-react';

interface Trip {
  _id: string;
  title: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  status?: string;
}

function MapPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Trips');
  
  // Mobile Sheet State
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  
  // Get initial tab from URL or default to 'friends'
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialTab = (searchParams.get('tab') as 'trips' | 'friends') || 'friends';
  
  const [activeTab, setActiveTab] = useState<'trips' | 'friends'>(initialTab);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);

  const filters = ['All Trips', 'Planning', 'Traveling', 'Completed'];

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentLayer, setCurrentLayer] = useState<'street' | 'satellite' | 'terrain' | 'dark'>('street');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const tileLayerRef = useRef<any>(null);
  const layerMenuRef = useRef<HTMLDivElement>(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) return `${Math.round(distance * 1000)}m away`;
    return `${Math.round(distance)}km away`;
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await userAPI.getProfile();
        setUserProfile(profile);
        if (profile.coordinates?.lat && profile.coordinates?.lng) {
          setUserLocation({ lat: profile.coordinates.lat, lng: profile.coordinates.lng });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  const handleTabChange = (tab: 'trips' | 'friends') => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const handleMyLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        if (mapRef.current) {
          const L = (await import('leaflet')).default;
          if (userMarkerRef.current) userMarkerRef.current.remove();
          
          const userIconHtml = `
            <div class="relative flex items-center justify-center">
              <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"></div>
              <div class="absolute w-10 h-10 bg-blue-500/30 rounded-full animate-ping"></div>
            </div>
          `;
          
          const userIcon = L.divIcon({
            html: userIconHtml,
            className: 'user-location-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
          
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapRef.current)
            .bindPopup('<div class="text-center p-2 font-bold text-sm">You are here</div>');
          
          mapRef.current.setView([latitude, longitude], 13, { animate: true });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable location services.');
      }
    );
  };

  const mapLayers = {
    street: { name: 'Street', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap' },
    satellite: { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '© Esri' },
    terrain: { name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '© OpenTopoMap' },
    dark: { name: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '© CartoDB' },
  };

  const handleLayerChange = async (layer: 'street' | 'satellite' | 'terrain' | 'dark') => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const L = (await import('leaflet')).default;
    tileLayerRef.current.remove();
    const layerConfig = mapLayers[layer];
    tileLayerRef.current = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: 19,
    }).addTo(mapRef.current);
    setCurrentLayer(layer);
    setShowLayerMenu(false);
  };

  // Rest of your data fetching logic remains unchanged
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (activeTab === 'trips') {
          const data = await tripAPI.getAll();
          setTrips(data);
          const firstTripWithCoords = data.find((trip: Trip) => trip.lat && trip.lng);
          if (firstTripWithCoords && !selectedTrip) setSelectedTrip(firstTripWithCoords._id);
          else if (data.length > 0 && !selectedTrip) setSelectedTrip(data[0]._id);
        } else {
          try {
            const matchedFriends = await matchAPI.getMatches();
            const matchedUsers = matchedFriends
              .map((match: any) => ({ ...match.user, connectionType: 'match' }))
              .filter((friend: any) => friend);
            
            let mutualUsers: any[] = [];
            try {
              const discoverResponse = await matchAPI.discover();
              if (discoverResponse.success && discoverResponse.profiles) {
                const mutualConnections = discoverResponse.profiles.filter((profile: any) => profile.connectionStatus === 'connected');
                mutualUsers = mutualConnections.map((profile: any) => ({
                  _id: profile.id, id: profile.id, name: profile.name, username: profile.username,
                  age: profile.age, location: profile.location, profilePicture: profile.profilePicture,
                  coordinates: profile.coordinates, updatedAt: profile.updatedAt, connectionType: 'mutual'
                }));
              }
            } catch (discoverError) { console.error('Error fetching discover profiles:', discoverError); }
            
            const matchedIds = new Set(matchedUsers.map((u: any) => u._id || u.id));
            const uniqueMutualUsers = mutualUsers.filter((u: any) => !matchedIds.has(u._id || u.id));
            const allFriends = [...matchedUsers, ...uniqueMutualUsers];
            
            setFriends(allFriends);
            
            const urlParams = new URLSearchParams(window.location.search);
            const userIdFromUrl = urlParams.get('user');
            
            if (userIdFromUrl) {
              const friendFromUrl = allFriends.find((f: any) => f._id === userIdFromUrl || f.id === userIdFromUrl);
              if (friendFromUrl) setSelectedFriend(friendFromUrl._id || friendFromUrl.id);
            } else if (!selectedFriend) {
              const firstFriendWithCoords = allFriends.find((friend: any) => friend.coordinates?.lat && friend.coordinates?.lng);
              if (firstFriendWithCoords) setSelectedFriend(firstFriendWithCoords._id);
            }
          } catch (error) { throw error; }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(event.target as Node)) setShowLayerMenu(false);
    };
    if (showLayerMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLayerMenu]);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trip.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All Trips' || trip.status?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredFriends = friends.filter((friend) => {
    return friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           friend.location?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDates = (startDate: string, endDate: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${new Date(startDate).toLocaleDateString('en-US', options)} - ${new Date(endDate).toLocaleDateString('en-US', options)}`;
  };

  const getDefaultImage = (destination: string) => {
    const images: { [key: string]: string } = {
      'nepal': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
      'japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80',
      'italy': 'https://images.unsplash.com/photo-1534113414509-0bd4d27f0e9a?w=400&q=80',
      'france': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
      'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80',
    };
    const dest = destination.toLowerCase();
    for (const key in images) { if (dest.includes(key)) return images[key]; }
    return images.default;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      const container = mapContainerRef.current;
      if (container && (container as any)._leaflet_id) return;

      const map = L.map(mapContainerRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
      });

      const layerConfig = mapLayers[currentLayer];
      tileLayerRef.current = L.tileLayer(layerConfig.url, { attribution: layerConfig.attribution, maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }
      if (tileLayerRef.current) { tileLayerRef.current.remove(); tileLayerRef.current = null; }
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; setMapLoaded(false); }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    if (activeTab === 'trips' && filteredTrips.length === 0) return;
    if (activeTab === 'friends' && filteredFriends.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      if (activeTab === 'trips') {
        const tripsWithCoords = filteredTrips.filter(trip => trip.lat && trip.lng);
        tripsWithCoords.forEach((trip) => {
          const isSelected = trip._id === selectedTrip;
          const iconHtml = `
            <div class="relative flex items-center justify-center transform transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="${isSelected ? '#059467' : 'rgba(5, 148, 103, 0.9)'}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `;

          const customIcon = L.divIcon({ html: iconHtml, className: 'custom-marker', iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] });
          const marker = L.marker([trip.lat!, trip.lng!], { icon: customIcon }).addTo(mapRef.current);
          const image = trip.imageUrl || getDefaultImage(trip.destination);
          
          const popupContent = `
            <div class="w-[240px]">
              <div class="h-[120px] w-full bg-cover bg-center relative rounded-t-xl" style="background-image: url('${image}')">
                ${trip.status ? `<div class="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 capitalize shadow-sm">${trip.status}</div>` : ''}
              </div>
              <div class="p-4 bg-white">
                <h3 class="text-slate-900 text-base font-bold leading-tight truncate">${trip.title}</h3>
                <p class="text-slate-500 text-xs mt-1 font-medium">${formatDates(trip.startDate, trip.endDate)}</p>
                <p class="text-slate-600 text-xs mt-1 truncate">${trip.destination}, ${trip.country}</p>
                <a href="/trips/${trip._id}" class="inline-flex items-center gap-1 mt-3 text-[#059467] text-sm font-bold hover:text-[#047854] transition-colors">
                  View Details →
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 240, className: 'custom-popup' });
          if (isSelected) marker.openPopup();
          markersRef.current[trip._id] = marker;
        });

        if (tripsWithCoords.length > 0) {
          const bounds = L.latLngBounds(tripsWithCoords.map((trip) => [trip.lat!, trip.lng!]));
          // Adjust padding on mobile so it centers above the bottom sheet
          const paddingBottom = window.innerWidth < 768 ? (isMobileExpanded ? 400 : 250) : 50;
          mapRef.current.fitBounds(bounds, { paddingBottomRight: [50, paddingBottom], paddingTopLeft: [50, 50], maxZoom: 10 });
        }
      } else {
        filteredFriends.forEach((friend) => {
          if (!friend.coordinates?.lat || !friend.coordinates?.lng) return;
          const isSelected = friend._id === selectedFriend;
          const iconHtml = `
            <div class="relative flex items-center justify-center transform transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
              <div class="w-12 h-12 rounded-full overflow-hidden border-[3px] ${isSelected ? 'border-[#059467]' : 'border-white'} shadow-lg bg-white">
                ${friend.profilePicture 
                  ? `<img src="${friend.profilePicture}" class="w-full h-full object-cover" />`
                  : `<div class="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">${friend.name?.charAt(0).toUpperCase()}</div>`
                }
              </div>
              ${isSelected ? `<div class="absolute -bottom-1 w-4 h-4 bg-[#059467] rounded-full border-2 border-white"></div>` : ''}
            </div>
          `;

          const customIcon = L.divIcon({ html: iconHtml, className: 'custom-marker', iconSize: [48, 48], iconAnchor: [24, 24], popupAnchor: [0, -24] });
          const marker = L.marker([friend.coordinates.lat, friend.coordinates.lng], { icon: customIcon }).addTo(mapRef.current);
          
          const popupContent = `
            <div class="w-[220px] p-4 bg-white rounded-xl">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0">
                  ${friend.profilePicture ? `<img src="${friend.profilePicture}" class="w-full h-full object-cover" />` : `<div class="w-full h-full flex items-center justify-center text-emerald-700 font-bold">${friend.name?.charAt(0).toUpperCase()}</div>`}
                </div>
                <div class="min-w-0">
                  <h3 class="text-slate-900 font-bold truncate">${friend.name}</h3>
                  ${friend.age ? `<p class="text-xs text-slate-500">${friend.age} yrs</p>` : ''}
                </div>
              </div>
              <p class="text-xs text-slate-600 mb-3 truncate font-medium"><i class="fas fa-map-marker-alt text-emerald-500 mr-1"></i>${friend.location || 'Unknown location'}</p>
              <a href="/profile/${friend.username}" class="block w-full text-center py-2 bg-slate-50 text-[#059467] rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors">
                View Profile
              </a>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 220, className: 'custom-popup' });
          if (isSelected) marker.openPopup();
          markersRef.current[friend._id] = marker;
        });

        if (filteredFriends.length > 0) {
          const coords = filteredFriends.filter(f => f.coordinates?.lat && f.coordinates?.lng).map(f => [f.coordinates.lat, f.coordinates.lng] as [number, number]);
          if (coords.length > 0) {
            const paddingBottom = window.innerWidth < 768 ? (isMobileExpanded ? 400 : 250) : 50;
            const bounds = L.latLngBounds(coords);
            mapRef.current.fitBounds(bounds, { paddingBottomRight: [50, paddingBottom], paddingTopLeft: [50, 50], maxZoom: 10 });
          }
        }
      }
    };
    updateMarkers();
  }, [filteredTrips, filteredFriends, selectedTrip, selectedFriend, mapLoaded, activeTab, isMobileExpanded]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const paddingBottom = window.innerWidth < 768 ? (isMobileExpanded ? [0, 250] : [0, 100]) : [0, 0];

    if (activeTab === 'trips' && selectedTrip) {
      const selectedTripData = trips.find((trip) => trip._id === selectedTrip);
      if (selectedTripData && selectedTripData.lat && selectedTripData.lng) {
        mapRef.current.setView([selectedTripData.lat, selectedTripData.lng], 8, { animate: true });
        markersRef.current[selectedTrip]?.openPopup();
      }
    } else if (activeTab === 'friends' && selectedFriend) {
      const selectedFriendData = friends.find((friend) => friend._id === selectedFriend);
      if (selectedFriendData && selectedFriendData.coordinates?.lat && selectedFriendData.coordinates?.lng) {
        mapRef.current.setView([selectedFriendData.coordinates.lat, selectedFriendData.coordinates.lng], 10, { animate: true });
        markersRef.current[selectedFriend]?.openPopup();
      }
    }
  }, [selectedTrip, selectedFriend, activeTab, mapLoaded, trips, friends]);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="hidden md:block z-50 relative">
        <Header />
      </div>
      
      <main className="flex-1 relative w-full h-full overflow-hidden">
        
        {/* Full Screen Map Container */}
        <div className="absolute inset-0 z-0">
          <div ref={mapContainerRef} className="w-full h-full" />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f231d] z-10">
              <div className="text-center flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-[#059467] animate-spin mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Initializing map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Map Controls - Floats above bottom sheet */}
        <div className={`absolute right-4 md:right-8 flex flex-col gap-3 md:gap-4 items-center z-[40] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileExpanded ? 'bottom-[calc(80vh+1rem)]' : 'bottom-[calc(35vh+1rem)] md:bottom-8'
        }`}>
          <div className="flex flex-col bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <button onClick={handleZoomIn} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors active:bg-slate-200">
              <Plus className="w-5 h-5" />
            </button>
            <div className="h-[1px] w-8 bg-slate-200 dark:bg-slate-700 mx-auto"></div>
            <button onClick={handleZoomOut} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors active:bg-slate-200">
              <Minus className="w-5 h-5" />
            </button>
          </div>

          <button onClick={handleMyLocation} className="w-11 h-11 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-[#059467] hover:bg-[#059467] hover:text-white transition-all active:scale-95 group">
            <Navigation className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </button>

          <div className="relative" ref={layerMenuRef}>
            <button onClick={() => setShowLayerMenu(!showLayerMenu)} className="w-11 h-11 bg-slate-900/90 dark:bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-700 dark:border-slate-200 flex items-center justify-center text-white dark:text-slate-900 hover:scale-105 transition-all active:scale-95">
              <Layers className="w-5 h-5" />
            </button>
            
            {showLayerMenu && (
              <div className="absolute bottom-full right-0 mb-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden min-w-[150px] animate-in fade-in slide-in-from-bottom-2">
                {Object.entries(mapLayers).map(([key, layer]) => (
                  <button key={key} onClick={() => handleLayerChange(key as any)} className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors flex items-center justify-between ${
                      currentLayer === key ? 'bg-[#059467]/10 text-[#059467]' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}>
                    <span>{layer.name}</span>
                    {currentLayer === key && <div className="w-2 h-2 rounded-full bg-[#059467]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Mobile Bottom Sheet */}
        <aside className={`absolute md:relative left-0 right-0 md:w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl z-30 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:h-full border-t md:border-t-0 md:border-r border-slate-200/50 dark:border-slate-800/50
          ${isMobileExpanded ? 'bottom-0 h-[80vh] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)]' : 'bottom-0 h-[35vh] md:h-full rounded-t-[2rem] md:rounded-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:shadow-2xl'}
        `}>
          
          {/* Mobile Drag Handle */}
          <div 
            className="w-full pt-4 pb-2 flex justify-center md:hidden cursor-pointer touch-none"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          >
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
          </div>

          <div className="px-5 pt-2 pb-4 flex-shrink-0">
            {/* Segmented Control Tabs */}
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md p-1 rounded-xl mb-5 border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => { handleTabChange('friends'); setSelectedTrip(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'friends' ? 'bg-white dark:bg-slate-700 text-[#059467] dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Buddies
              </button>
              <button
                onClick={() => { handleTabChange('trips'); setSelectedFriend(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'trips' ? 'bg-white dark:bg-slate-700 text-[#059467] dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Destinations
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059467]/30 transition-all"
                placeholder={activeTab === 'friends' ? 'Find travel buddies...' : 'Search locations...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => window.innerWidth < 768 && setIsMobileExpanded(true)}
              />
            </div>
          </div>

          {/* Filters - Trips Only */}
          {activeTab === 'trips' && (
            <div className="px-5 pb-3 overflow-x-auto hide-scrollbar flex-shrink-0 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all flex-shrink-0 ${
                      activeFilter === filter
                        ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scrollable List Container */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-[#059467] animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-500">Loading {activeTab}...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-rose-500 text-sm font-medium mb-2">{error}</p>
                <button onClick={() => window.location.reload()} className="text-[#059467] text-sm font-bold hover:underline">Try again</button>
              </div>
            ) : activeTab === 'trips' ? (
              filteredTrips.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"><MapPin className="w-6 h-6 text-slate-400" /></div>
                  <p className="text-slate-500 font-medium mb-4">{trips.length === 0 ? 'Map out your first adventure!' : 'No trips match your search.'}</p>
                  {trips.length === 0 && (
                    <button onClick={() => router.push('/trips/new')} className="px-5 py-2.5 bg-[#059467] text-white rounded-xl text-sm font-bold shadow-md shadow-[#059467]/20 hover:-translate-y-0.5 transition-all">Create Trip</button>
                  )}
                </div>
              ) : (
                filteredTrips.map((trip) => {
                  const image = trip.imageUrl || getDefaultImage(trip.destination);
                  const hasLocation = trip.lat && trip.lng;
                  return (
                    <div
                      key={trip._id}
                      onClick={() => {
                        if (hasLocation) {
                          setSelectedTrip(trip._id);
                          if (window.innerWidth < 768) setIsMobileExpanded(false); // Auto collapse on select on mobile
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all ${
                        hasLocation ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'opacity-60 bg-slate-50/50'
                      } ${selectedTrip === trip._id && hasLocation ? 'border-[#059467] bg-emerald-50/30 dark:bg-emerald-900/10 ring-1 ring-[#059467]/30 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'}`}
                    >
                      <div className="flex gap-4 items-center">
                        <img src={image} className={`w-16 h-16 shrink-0 rounded-xl object-cover shadow-sm ${selectedTrip === trip._id ? '' : 'grayscale-[30%]'}`} alt={trip.title} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm mb-0.5">{trip.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate mb-1.5">{trip.destination}, {trip.country}</p>
                          <div className="flex gap-2">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-semibold">{formatDates(trip.startDate, trip.endDate)}</span>
                            {hasLocation ? (
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold capitalize ${trip.status === 'Completed' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{trip.status || 'Planning'}</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md font-bold">No location</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // Friends List Layout 
              filteredFriends.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-6 h-6 text-slate-400" /></div>
                  <p className="text-slate-500 font-medium mb-4">{friends.length === 0 ? 'Connect with buddies to see them on the map!' : 'No buddies found in search.'}</p>
                  {friends.length === 0 && (
                    <button onClick={() => router.push('/match')} className="px-5 py-2.5 bg-[#059467] text-white rounded-xl text-sm font-bold shadow-md shadow-[#059467]/20 hover:-translate-y-0.5 transition-all">Discover Buddies</button>
                  )}
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const hasLocation = friend.coordinates?.lat && friend.coordinates?.lng;
                  const distance = hasLocation && userLocation ? calculateDistance(userLocation.lat, userLocation.lng, friend.coordinates.lat, friend.coordinates.lng) : null;
                  const isOnline = friend.updatedAt ? (new Date().getTime() - new Date(friend.updatedAt).getTime()) < 5 * 60 * 1000 : false;
                  
                  return (
                    <div
                      key={friend._id}
                      onClick={() => {
                        if (hasLocation) {
                          setSelectedFriend(friend._id);
                          if (window.innerWidth < 768) setIsMobileExpanded(false); // Auto collapse on select
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        hasLocation ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'opacity-60 bg-slate-50/50'
                      } ${selectedFriend === friend._id && hasLocation ? 'border-[#059467] bg-emerald-50/30 dark:bg-emerald-900/10 ring-1 ring-[#059467]/30 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'}`}
                    >
                      <div className="flex gap-4 items-center">
                        <div className="relative">
                          {friend.profilePicture ? (
                            <img src={friend.profilePicture} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm" alt={friend.name} />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-[#059467] to-teal-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">{friend.name?.charAt(0)}</div>
                          )}
                          <div className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{friend.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1">
                            {hasLocation ? <MapPin className="w-3 h-3 text-[#059467]" /> : null}
                            {friend.location || 'Location hidden'}
                          </p>
                          {distance !== null && (
                            <p className="text-[10px] font-bold text-[#059467] mt-1 bg-emerald-50 inline-block px-1.5 py-0.5 rounded uppercase tracking-wider">{formatDistance(distance)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
            {/* Spacer for mobile bottom sheet curve */}
            <div className="h-6 w-full md:hidden"></div>
          </div>
        </aside>

      </main>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; }
        
        /* Leaflet overrides */
        .custom-marker { background: transparent; border: none; }
        .user-location-marker { background: transparent; border: none; }
        .leaflet-container { z-index: 0 !important; background: transparent; }
        .leaflet-pane { z-index: 1 !important; }
        .leaflet-top, .leaflet-bottom { z-index: 2 !important; }
        .custom-popup .leaflet-popup-content-wrapper { padding: 0; border-radius: 1rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255,255,255,0.2); }
        .dark .custom-popup .leaflet-popup-content-wrapper { background-color: #1e293b; border-color: #334155; }
        .custom-popup .leaflet-popup-content { margin: 0; min-width: 200px !important; }
        .custom-popup .leaflet-popup-tip { background: white; }
        .dark .custom-popup .leaflet-popup-tip { background: #1e293b; }
        .leaflet-control-attribution { display: none !important; } /* Hide attribution for cleaner UI if permitted */
      `}</style>
    </div>
  );
}

export default function ProtectedMapPage() {
  return (
    <ProtectedRoute>
      <MapPage />
    </ProtectedRoute>
  );
}
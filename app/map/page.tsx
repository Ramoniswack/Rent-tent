'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import { tripAPI, userAPI, matchAPI } from '../../services/api';
import { MapPin, Search, Plus, Minus, Navigation, Layers, Loader2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'trips' | 'friends'>('trips');
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
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Format distance for display
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else {
      return `${Math.round(distance)}km away`;
    }
  };

  // Load user profile to get their coordinates
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await userAPI.getProfile();
        setUserProfile(profile);
        if (profile.coordinates?.lat && profile.coordinates?.lng) {
          setUserLocation({
            lat: profile.coordinates.lat,
            lng: profile.coordinates.lng
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  // Handle zoom in
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  // Handle my location
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
          
          // Remove existing user marker if any
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }
          
          // Create custom user location icon
          const userIconHtml = `
            <div class="relative flex items-center justify-center">
              <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
              <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
            </div>
          `;
          
          const userIcon = L.divIcon({
            html: userIconHtml,
            className: 'user-location-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          
          // Add user location marker
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapRef.current)
            .bindPopup('<div class="text-center p-2"><strong>Your Location</strong></div>');
          
          // Pan to user location
          mapRef.current.setView([latitude, longitude], 13, { animate: true });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable location services.');
      }
    );
  };

  // Map layer configurations
  const mapLayers = {
    street: {
      name: 'Street',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
    },
    satellite: {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri',
    },
    terrain: {
      name: 'Terrain',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap',
    },
    dark: {
      name: 'Dark',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB',
    },
  };

  // Handle layer change
  const handleLayerChange = async (layer: 'street' | 'satellite' | 'terrain' | 'dark') => {
    if (!mapRef.current || !tileLayerRef.current) return;

    const L = (await import('leaflet')).default;
    
    // Remove current tile layer
    tileLayerRef.current.remove();
    
    // Add new tile layer
    const layerConfig = mapLayers[layer];
    tileLayerRef.current = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: 19,
    }).addTo(mapRef.current);
    
    setCurrentLayer(layer);
    setShowLayerMenu(false);
  };

  // Fetch trips and friends from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (activeTab === 'trips') {
          const data = await tripAPI.getAll();
          
          console.log('All trips from API:', data);
          console.log('Trips with coordinates:', data.filter((trip: Trip) => trip.lat && trip.lng));
          
          // Show all trips, not just those with coordinates
          setTrips(data);
          
          // Select first trip with coordinates by default
          const firstTripWithCoords = data.find((trip: Trip) => trip.lat && trip.lng);
          if (firstTripWithCoords && !selectedTrip) {
            setSelectedTrip(firstTripWithCoords._id);
          } else if (data.length > 0 && !selectedTrip) {
            // If no trips have coordinates, select the first one anyway
            setSelectedTrip(data[0]._id);
          }
        } else {
          // Fetch matched friends
          const matchedFriends = await matchAPI.getMatches();
          
          // Extract user objects from match data
          const allFriends = matchedFriends
            .map((match: any) => match.user)
            .filter((friend: any) => friend); // Remove null/undefined
          
          // Set all friends (even without coordinates) so they show in the list
          setFriends(allFriends);
          
          // Select first friend with coordinates by default
          const firstFriendWithCoords = allFriends.find(
            (friend: any) => friend.coordinates?.lat && friend.coordinates?.lng
          );
          if (firstFriendWithCoords && !selectedFriend) {
            setSelectedFriend(firstFriendWithCoords._id);
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Close layer menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(event.target as Node)) {
        setShowLayerMenu(false);
      }
    };

    if (showLayerMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLayerMenu]);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All Trips' || 
                         trip.status?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         friend.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Format dates
  const formatDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Get default image based on destination
  const getDefaultImage = (destination: string) => {
    const images: { [key: string]: string } = {
      'nepal': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
      'japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80',
      'italy': 'https://images.unsplash.com/photo-1534113414509-0bd4d27f0e9a?w=400&q=80',
      'france': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
      'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80',
    };
    
    const dest = destination.toLowerCase();
    for (const key in images) {
      if (dest.includes(key)) return images[key];
    }
    return images.default;
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    
    // Check if map is already initialized
    if (mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Clear any existing map instance on the container
      const container = mapContainerRef.current;
      if (container && (container as any)._leaflet_id) {
        // Container already has a map, remove it
        return;
      }

      const map = L.map(mapContainerRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
      });

      const layerConfig = mapLayers[currentLayer];
      tileLayerRef.current = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
        tileLayerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    // Check if we have data to display
    if (activeTab === 'trips' && filteredTrips.length === 0) return;
    if (activeTab === 'friends' && filteredFriends.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      if (activeTab === 'trips') {
        // Add markers for each trip that has coordinates
        const tripsWithCoords = filteredTrips.filter(trip => trip.lat && trip.lng);
        
        tripsWithCoords.forEach((trip) => {
          
          const isSelected = trip._id === selectedTrip;

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

          const marker = L.marker([trip.lat!, trip.lng!], { icon: customIcon }).addTo(mapRef.current);

          const image = trip.imageUrl || getDefaultImage(trip.destination);
          const popupContent = `
            <div class="w-[240px]">
              <div class="h-[120px] w-full bg-cover bg-center relative rounded-t-xl" style="background-image: url('${image}')">
                ${
                  trip.status
                    ? `<div class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-[#0f231d] capitalize">${trip.status}</div>`
                    : ''
                }
              </div>
              <div class="p-4 bg-white">
                <h3 class="text-[#0f231d] text-lg font-bold leading-tight">${trip.title}</h3>
                <p class="text-gray-500 text-xs mt-1 font-medium">${formatDates(trip.startDate, trip.endDate)}</p>
                <p class="text-gray-600 text-xs mt-1">${trip.destination}, ${trip.country}</p>
                <a href="/trips/${
                  trip._id
                }" class="flex items-center gap-1 mt-3 text-[#059467] text-sm font-bold hover:underline">
                  View Details →
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 240,
            className: 'custom-popup',
          });

          if (isSelected) {
            marker.openPopup();
          }

          markersRef.current[trip._id] = marker;
        });

        // Fit bounds for trips with coordinates
        if (tripsWithCoords.length > 0) {
          const bounds = L.latLngBounds(
            tripsWithCoords.map((trip) => [trip.lat!, trip.lng!])
          );
          mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
      } else {
        // Add markers for each friend
        filteredFriends.forEach((friend) => {
          if (!friend.coordinates?.lat || !friend.coordinates?.lng) return;
          
          const isSelected = friend._id === selectedFriend;

          const iconHtml = `
            <div class="relative flex items-center justify-center transform transition-transform ${
              isSelected ? 'scale-125' : 'hover:scale-110'
            }">
              <div class="w-12 h-12 rounded-full overflow-hidden border-4 ${
                isSelected ? 'border-[#059467]' : 'border-white'
              } shadow-lg">
                ${friend.profilePicture 
                  ? `<img src="${friend.profilePicture}" class="w-full h-full object-cover" />`
                  : `<div class="w-full h-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center text-white font-bold text-xl">${friend.name?.charAt(0).toUpperCase()}</div>`
                }
              </div>
              ${
                isSelected
                  ? `<div class="absolute w-4 h-4 bg-[#059467] rounded-full animate-ping top-[40px]"></div>`
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

          const marker = L.marker([friend.coordinates.lat, friend.coordinates.lng], { icon: customIcon })
            .addTo(mapRef.current);

          const popupContent = `
            <div class="w-[200px] p-4 bg-white">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#059467] to-[#047854] flex-shrink-0">
                  ${friend.profilePicture 
                    ? `<img src="${friend.profilePicture}" class="w-full h-full object-cover" />`
                    : `<div class="w-full h-full flex items-center justify-center text-white font-bold text-xl">${friend.name?.charAt(0).toUpperCase()}</div>`
                  }
                </div>
                <div>
                  <h3 class="text-[#0f231d] font-bold">${friend.name}</h3>
                  ${friend.age ? `<p class="text-xs text-gray-500">${friend.age} years old</p>` : ''}
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-3">${friend.location || 'Location not specified'}</p>
              <a href="/profile/${friend.username}" class="flex items-center gap-1 text-[#059467] text-sm font-bold hover:underline">
                View Profile →
              </a>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 200,
            className: 'custom-popup',
          });

          if (isSelected) {
            marker.openPopup();
          }

          markersRef.current[friend._id] = marker;
        });

        // Fit bounds for friends
        if (filteredFriends.length > 0) {
          const coords = filteredFriends
            .filter(f => f.coordinates?.lat && f.coordinates?.lng)
            .map(f => [f.coordinates.lat, f.coordinates.lng] as [number, number]);
          
          if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
          }
        }
      }
    };

    updateMarkers();
  }, [filteredTrips, filteredFriends, selectedTrip, selectedFriend, mapLoaded, activeTab]);

  // Pan to selected trip or friend
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    if (activeTab === 'trips' && selectedTrip) {
      const selectedTripData = trips.find((trip) => trip._id === selectedTrip);
      if (selectedTripData && selectedTripData.lat && selectedTripData.lng) {
        mapRef.current.setView([selectedTripData.lat, selectedTripData.lng], 8, {
          animate: true,
        });
        markersRef.current[selectedTrip]?.openPopup();
      }
    } else if (activeTab === 'friends' && selectedFriend) {
      const selectedFriendData = friends.find((friend) => friend._id === selectedFriend);
      if (selectedFriendData && selectedFriendData.coordinates?.lat && selectedFriendData.coordinates?.lng) {
        mapRef.current.setView([selectedFriendData.coordinates.lat, selectedFriendData.coordinates.lng], 10, {
          animate: true,
        });
        markersRef.current[selectedFriend]?.openPopup();
      }
    }
  }, [selectedTrip, selectedFriend, activeTab, mapLoaded, trips, friends]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - Hidden on mobile */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      <main className="flex-1 relative flex flex-col md:flex-row overflow-hidden h-[calc(100dvh-80px)] md:h-auto">
        {/* Sidebar */}
        <aside className="w-full md:w-[400px] h-[45vh] md:h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl flex flex-col border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 transition-all duration-300 ease-in-out z-10 overflow-hidden">
          {/* Mobile handle */}
          <div className="h-1 w-12 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto my-3 md:hidden"></div>

          {/* Search Bar */}
          <div className="p-4 md:p-6 pb-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-3 md:mb-4">
              <button
                onClick={() => {
                  setActiveTab('trips');
                  setSelectedFriend(null);
                }}
                className={`flex-1 px-3 md:px-4 py-2 rounded-xl text-sm md:text-base font-bold transition-all ${
                  activeTab === 'trips'
                    ? 'bg-[#059467] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                Trips
              </button>
              <button
                onClick={() => {
                  setActiveTab('friends');
                  setSelectedTrip(null);
                }}
                className={`flex-1 px-3 md:px-4 py-2 rounded-xl text-sm md:text-base font-bold transition-all ${
                  activeTab === 'friends'
                    ? 'bg-[#059467] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                Friends
              </button>
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-[#0d1c17] dark:text-white mb-3 md:mb-4">
              {activeTab === 'trips' ? 'Your Trips' : 'Your Friends'}
            </h1>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 md:w-5 md:h-5 text-[#059467]" />
              </div>
              <input
                className="block w-full pl-9 md:pl-10 pr-3 py-2.5 md:py-3 text-sm md:text-base border-none rounded-2xl leading-5 bg-[#f5f8f7] dark:bg-slate-800 text-[#0d1c17] dark:text-white placeholder-[#059467]/60 focus:outline-none focus:ring-2 focus:ring-[#059467]/50 focus:bg-white dark:focus:bg-slate-700 transition-shadow shadow-inner"
                placeholder={activeTab === 'trips' ? 'Search locations...' : 'Search friends...'}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters - Only for Trips */}
          {activeTab === 'trips' && (
            <div className="px-4 md:px-6 py-2 md:py-4 overflow-x-auto hide-scrollbar shrink-0">
              <div className="flex gap-2 min-w-max md:min-w-0">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full shadow-md whitespace-nowrap transition-all flex-shrink-0 ${
                      activeFilter === filter
                        ? 'bg-[#059467] text-white scale-105'
                        : 'bg-white dark:bg-slate-800 text-[#0d1c17] dark:text-white border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trip Cards List */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 md:pb-6 space-y-3 md:space-y-4 hide-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#059467] animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Loading {activeTab === 'trips' ? 'trips' : 'friends'}...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-[#059467] text-sm font-medium hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : activeTab === 'trips' ? (
              // Trips List
              filteredTrips.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {trips.length === 0 ? 'No trips yet' : 'No trips found'}
                  </p>
                  {trips.length === 0 && (
                    <button
                      onClick={() => router.push('/trips/new')}
                      className="px-4 py-2 bg-[#059467] text-white rounded-full text-sm font-semibold hover:bg-[#047854] transition-colors"
                    >
                      Create Your First Trip
                    </button>
                  )}
                </div>
              ) : (
                filteredTrips.map((trip) => {
                  const image = trip.imageUrl || getDefaultImage(trip.destination);
                  const hasLocation = trip.lat && trip.lng;
                  return (
                    <div
                      key={trip._id}
                      onClick={() => hasLocation && setSelectedTrip(trip._id)}
                      className={`bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-md border hover:shadow-lg transition-all ${
                        hasLocation ? 'cursor-pointer' : 'cursor-default opacity-60'
                      } group flex gap-4 items-center ${
                        selectedTrip === trip._id && hasLocation
                          ? 'border-[#059467] ring-2 ring-[#059467]/10'
                          : 'border-gray-100 dark:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-20 h-20 shrink-0 rounded-xl bg-cover bg-center transition-all relative ${
                          selectedTrip === trip._id ? '' : 'grayscale group-hover:grayscale-0'
                        }`}
                        style={{ backgroundImage: `url(${image})` }}
                      >
                        {!hasLocation && (
                          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white/80" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-[#0d1c17] dark:text-white truncate">{trip.title}</h4>
                          {hasLocation ? (
                            <MapPin
                              className={`w-5 h-5 transition-colors flex-shrink-0 ml-2 ${
                                selectedTrip === trip._id
                                  ? 'text-[#059467]'
                                  : 'text-gray-400 group-hover:text-[#059467]'
                              }`}
                            />
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex-shrink-0 ml-2 font-medium">
                              No location
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDates(trip.startDate, trip.endDate)}
                        </p>
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                              selectedTrip === trip._id
                                ? 'bg-[#e7f4f0] text-[#059467]'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {trip.status || 'Planning'}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              selectedTrip === trip._id
                                ? 'bg-[#e7f4f0] text-[#059467]'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {trip.country}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // Friends List
              filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {friends.length === 0 ? 'No matched friends yet' : 'No friends found'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    {friends.length === 0 
                      ? 'Match with travel buddies to see them here' 
                      : 'Try adjusting your search'}
                  </p>
                  {friends.length === 0 && (
                    <button
                      onClick={() => router.push('/match')}
                      className="px-4 py-2 bg-[#059467] text-white rounded-full text-sm font-semibold hover:bg-[#047854] transition-colors"
                    >
                      Find Travel Buddies
                    </button>
                  )}
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const hasLocation = friend.coordinates?.lat && friend.coordinates?.lng;
                  const distance = hasLocation && userLocation
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        friend.coordinates.lat,
                        friend.coordinates.lng
                      )
                    : null;
                  
                  // Determine online status (user is online if last updated within 5 minutes)
                  const isOnline = friend.updatedAt 
                    ? (new Date().getTime() - new Date(friend.updatedAt).getTime()) < 5 * 60 * 1000
                    : false;
                  
                  return (
                    <div
                      key={friend._id}
                      onClick={() => hasLocation && setSelectedFriend(friend._id)}
                      className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md border hover:shadow-lg transition-all ${
                        hasLocation ? 'cursor-pointer' : 'cursor-default opacity-60'
                      } group ${
                        selectedFriend === friend._id && hasLocation
                          ? 'border-[#059467] ring-2 ring-[#059467]/10'
                          : 'border-gray-100 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#059467] to-[#047854] flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-md">
                            {friend.profilePicture ? (
                              <img src={friend.profilePicture} alt={friend.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                                {friend.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {/* Online/Offline Status Indicator */}
                          <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                            isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} title={isOnline ? 'Online' : 'Offline'}>
                            {isOnline && (
                              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                            )}
                          </div>
                          {hasLocation && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#059467] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                              <MapPin className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-[#0d1c17] dark:text-white truncate">{friend.name}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                isOnline 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                              }`}>
                                {isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>
                            {!hasLocation && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                No location
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {friend.location && !friend.location.match(/^[\d\.\,\s\-]+$/) 
                              ? friend.location 
                              : hasLocation 
                                ? 'Location set' 
                                : 'Location not set'}
                          </p>
                          {friend.age && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{friend.age} years old</p>
                          )}
                          {distance !== null && (
                            <div className="flex items-center gap-1 mt-2">
                              <MapPin className="w-3 h-3 text-[#059467]" />
                              <span className="text-xs font-semibold text-[#059467]">
                                {formatDistance(distance)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {hasLocation && userLocation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${friend.coordinates.lat},${friend.coordinates.lng}&travelmode=driving`;
                            window.open(url, '_blank');
                          }}
                          className="w-full px-4 py-2 bg-[#059467] hover:bg-[#047854] text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Navigation className="w-4 h-4" />
                          Find Route
                        </button>
                      )}
                    </div>
                  );
                })
              )
            )}
          </div>

          {/* Footer Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none rounded-b-[2rem]"></div>
        </aside>

        {/* Map Container */}
        <div className="flex-1 relative z-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f5f8f7] dark:bg-[#0f231d]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059467] mx-auto mb-4"></div>
                <p className="text-[#0d1c17] dark:text-white">Loading map...</p>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 flex flex-col gap-3 md:gap-4 items-center z-[1000] pointer-events-auto">
            {/* Zoom Controls */}
            <div className="flex flex-col bg-white dark:bg-slate-800 rounded-full shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
              <button 
                onClick={handleZoomIn}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-[#0d1c17] dark:text-white active:scale-95"
                title="Zoom in"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <div className="h-[1px] w-6 md:w-8 bg-gray-200 dark:bg-slate-600 mx-auto"></div>
              <button 
                onClick={handleZoomOut}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-[#0d1c17] dark:text-white active:scale-95"
                title="Zoom out"
              >
                <Minus className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* My Location Button */}
            <button 
              onClick={handleMyLocation}
              className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-full shadow-2xl flex items-center justify-center text-[#059467] hover:bg-[#059467] hover:text-white transition-all transform hover:scale-105 active:scale-95 group border border-gray-200 dark:border-slate-700"
              title="My location"
            >
              <Navigation className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-45" />
            </button>

            {/* Layers Button with Menu */}
            <div className="relative" ref={layerMenuRef}>
              <button 
                className="w-10 h-10 md:w-12 md:h-12 bg-[#0f231d] dark:bg-slate-700 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-[#059467] transition-all transform hover:scale-105 active:scale-95 border border-[#0f231d] dark:border-slate-600"
                title="Map layers"
                onClick={() => setShowLayerMenu(!showLayerMenu)}
              >
                <Layers className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Layer Menu */}
              {showLayerMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden min-w-[140px] md:min-w-[160px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {Object.entries(mapLayers).map(([key, layer]) => (
                    <button
                      key={key}
                      onClick={() => handleLayerChange(key as any)}
                      className={`w-full px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium transition-colors flex items-center justify-between ${
                        currentLayer === key
                          ? 'bg-[#059467] text-white'
                          : 'text-[#0d1c17] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{layer.name}</span>
                      {currentLayer === key && (
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .user-location-marker {
          background: transparent;
          border: none;
        }
        .leaflet-container {
          z-index: 0 !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-top,
        .leaflet-bottom {
          z-index: 2 !important;
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
          min-width: 200px !important;
          max-width: 240px !important;
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

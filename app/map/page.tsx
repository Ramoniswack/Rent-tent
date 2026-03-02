'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import { tripAPI, userAPI, matchAPI } from '../../services/api';
import { 
  MapPin, Search, Plus, Minus, Navigation, Layers, 
  Loader2, Car, X as CloseIcon, Navigation2, MessageCircle, ExternalLink 
} from 'lucide-react';

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
  elevation?: number;
}

interface Stop {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  time: string;
  activity?: string;
  elevation?: number;
}

function MapPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Trips');
  
  // Mobile Sheet State
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  
  // Desktop sidebar toggle
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  
  // Get initial tab from URL or default to 'friends'
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialTab = (searchParams?.get('tab') as 'trips' | 'friends') || 'friends';
  
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
  const routePolylineRef = useRef<any>(null);

  const filters = ['All Trips', 'Planning', 'Traveling', 'Completed'];

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentLayer, setCurrentLayer] = useState<'street' | 'satellite' | 'terrain' | 'dark'>('street');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const tileLayerRef = useRef<any>(null);
  const layerMenuRef = useRef<HTMLDivElement>(null);
  
  // Route finding states
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const routeMode = 'car'; // Fixed to car mode only
  const [routeControl, setRouteControl] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; type?: 'road' | 'estimate' | 'manual' } | null>(null);
  const [routeDestinationId, setRouteDestinationId] = useState<string | null>(null); // Track which destination has active route
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const animatedMarkerRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  
  // Manual route drawing states
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<{ lat: number; lng: number }[]>([]);
  const drawnMarkersRef = useRef<any[]>([]);
  const tempPolylineRef = useRef<any>(null);
  const isDrawingModeRef = useRef(false);
  const drawnPointsRef = useRef<{ lat: number; lng: number }[]>([]);
  
  // Itinerary stops states
  const [tripItinerary, setTripItinerary] = useState<Stop[]>([]);
  const itineraryMarkersRef = useRef<{ [key: string]: any }>({});
  const itineraryRoutesRef = useRef<any[]>([]);
  
  // Elevation states
  const [elevationLoading, setElevationLoading] = useState(false);

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

  // Fetch elevation data for a single location
  const fetchElevation = async (lat: number, lng: number): Promise<number | null> => {
    try {
      const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return Math.round(data.results[0].elevation);
      }
      return null;
    } catch (error) {
      console.error('Error fetching elevation:', error);
      return null;
    }
  };

  // Fetch elevation data for multiple locations (batch)
  const fetchElevationBatch = async (locations: { lat: number; lng: number }[]): Promise<(number | null)[]> => {
    try {
      const locationsStr = locations.map(loc => `${loc.lat},${loc.lng}`).join('|');
      const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${locationsStr}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.map((result: any) => Math.round(result.elevation));
      }
      return locations.map(() => null);
    } catch (error) {
      console.error('Error fetching elevation batch:', error);
      return locations.map(() => null);
    }
  };

  const formatElevation = (elevation: number | null | undefined): string => {
    if (elevation === null || elevation === undefined) return '';
    return `${elevation.toLocaleString()}m`;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) return `${Math.round(distance * 1000)}m away`;
    return `${Math.round(distance)}km away`;
  };

  const clearRoute = () => {
    // Remove the route polyline
    if (routePolylineRef.current && mapRef.current) {
      try {
        mapRef.current.removeLayer(routePolylineRef.current);
      } catch (err) {}
      routePolylineRef.current = null;
    }
    
    // Remove old route control if exists
    if (routeControl && mapRef.current) {
      try {
        mapRef.current.removeControl(routeControl);
      } catch (err) {
        try {
          if (routeControl.remove) routeControl.remove();
        } catch (e) {}
      }
      setRouteControl(null);
    }
    
    // Remove animated marker
    if (animatedMarkerRef.current && mapRef.current) {
      try {
        mapRef.current.removeLayer(animatedMarkerRef.current);
      } catch (err) {}
      animatedMarkerRef.current = null;
    }
    
    // Cancel animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Clear manual drawing
    clearManualRoute();
    
    setRouteInfo(null);
    setRouteDestinationId(null);
    setShowRoutePanel(false);
  };

  const clearManualRoute = () => {
    drawnMarkersRef.current.forEach(marker => {
      if (mapRef.current) {
        try { mapRef.current.removeLayer(marker); } catch (err) {}
      }
    });
    drawnMarkersRef.current = [];
    
    if (tempPolylineRef.current && mapRef.current) {
      try { mapRef.current.removeLayer(tempPolylineRef.current); } catch (err) {}
      tempPolylineRef.current = null;
    }
    
    setDrawnPoints([]);
    drawnPointsRef.current = [];
    setIsDrawingMode(false);
    isDrawingModeRef.current = false;
  };

  const startManualDrawing = () => {
    clearRoute();
    setIsDrawingMode(true);
    isDrawingModeRef.current = true;
    setDrawnPoints([]);
    drawnPointsRef.current = [];
    setShowRoutePanel(true);
  };

  const finishManualDrawing = async (L: any) => {
    if (drawnPointsRef.current.length < 2) {
      alert('Please add at least 2 points to create a route');
      return;
    }
    
    setIsDrawingMode(false);
    isDrawingModeRef.current = false;
    
    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < drawnPointsRef.current.length - 1; i++) {
      totalDistance += calculateDistance(
        drawnPointsRef.current[i].lat,
        drawnPointsRef.current[i].lng,
        drawnPointsRef.current[i + 1].lat,
        drawnPointsRef.current[i + 1].lng
      );
    }
    
    const speed = 60;
    const durationMin = Math.round((totalDistance / speed) * 60);
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;
    
    if (tempPolylineRef.current && mapRef.current) {
      mapRef.current.removeLayer(tempPolylineRef.current);
    }
    
    const finalPolyline = L.polyline(
      drawnPointsRef.current.map(p => [p.lat, p.lng]),
      { color: '#10b981', opacity: 0.8, weight: 5 }
    ).addTo(mapRef.current);
    
    routePolylineRef.current = finalPolyline;
    tempPolylineRef.current = null;
    
    drawnMarkersRef.current.forEach(marker => {
      if (mapRef.current) mapRef.current.removeLayer(marker);
    });
    drawnMarkersRef.current = [];
    
    setRouteInfo({
      distance: `~${totalDistance.toFixed(1)} km`,
      duration: `~${hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}`,
      type: 'manual'
    });
    
    mapRef.current.fitBounds(finalPolyline.getBounds(), { padding: [50, 50] });
  };

  const cancelManualDrawing = () => {
    clearManualRoute();
    setShowRoutePanel(false);
  };

  const calculateRoute = async (destination: { lat: number; lng: number }, destinationId: string) => {
    clearRoute();
    setRouteDestinationId(destinationId);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lng: longitude };
          setUserLocation(currentLocation);
          
          if (mapRef.current) {
            const L = (await import('leaflet')).default;
            if (userMarkerRef.current) userMarkerRef.current.remove();
            const userIconHtml = `
              <div class="relative flex items-center justify-center">
                <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"></div>
                <div class="absolute w-10 h-10 bg-blue-500/30 rounded-full animate-ping"></div>
              </div>
            `;
            userMarkerRef.current = L.marker([latitude, longitude], { 
              icon: L.divIcon({ html: userIconHtml, className: 'user-location-marker', iconSize: [40, 40], iconAnchor: [20, 20] })
            }).addTo(mapRef.current).bindPopup('<div class="text-center p-2 font-bold text-sm">You are here</div>');
          }
          
          setIsCalculatingRoute(true);
          try {
            const L = (await import('leaflet')).default;
            useFallbackRoute(L, destination, currentLocation);
          } catch (error: any) {
            setIsCalculatingRoute(false);
          }
        },
        (error) => {
          if (!userLocation || !mapRef.current) {
            alert('Please enable your location to get directions');
            return;
          }
          setIsCalculatingRoute(true);
          (async () => {
            try {
              const L = (await import('leaflet')).default;
              useFallbackRoute(L, destination, userLocation);
            } catch (error: any) {
              setIsCalculatingRoute(false);
            }
          })();
        }
      );
    } else {
      if (!userLocation || !mapRef.current) {
        alert('Please enable your location to get directions');
        return;
      }
      setIsCalculatingRoute(true);
      try {
        const L = (await import('leaflet')).default;
        useFallbackRoute(L, destination, userLocation);
      } catch (error: any) {
        setIsCalculatingRoute(false);
      }
    }
  };

  const useFallbackRoute = async (L: any, destination: { lat: number; lng: number }, fromLocation: { lat: number; lng: number }) => {
    if (!fromLocation || !mapRef.current) return;
    
    try {
      // Smart routing: Use foot for < 40km distances, driving for longer ones
      const distanceCheck = calculateDistance(fromLocation.lat, fromLocation.lng, destination.lat, destination.lng);
      const profile = distanceCheck < 40 ? 'foot' : 'driving';
      const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${fromLocation.lng},${fromLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      
      const response = await fetch(osrmUrl, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`OSRM API returned ${response.status}`);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        
        const polyline = L.polyline(coordinates, { color: '#10b981', opacity: 0.8, weight: 5 }).addTo(mapRef.current);
        routePolylineRef.current = polyline;
        
        const distanceKm = (route.distance / 1000).toFixed(1);
        let durationSeconds = route.duration;
        
        if (route.distance > 200000) durationSeconds = durationSeconds * 1.8;
        else if (route.distance > 100000) durationSeconds = durationSeconds * 1.5;
        else durationSeconds = durationSeconds * 1.3;
        
        const durationMin = Math.round(durationSeconds / 60);
        const hours = Math.floor(durationMin / 60);
        const minutes = durationMin % 60;
        
        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: `${hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}`,
          type: 'road'
        });
        
        createAnimatedMarker(L, coordinates.map((coord: number[]) => ({ lat: coord[0], lng: coord[1] })));
        setRouteControl({ remove: () => polyline.remove() });
        setIsCalculatingRoute(false);
        setShowRoutePanel(true);
        mapRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      } else {
        throw new Error('No route found from OSRM');
      }
    } catch (err) {
      if (!mapRef.current) return;
      const polyline = L.polyline(
        [[fromLocation.lat, fromLocation.lng], [destination.lat, destination.lng]],
        { color: '#10b981', opacity: 0.6, weight: 4, dashArray: '10, 10' }
      ).addTo(mapRef.current);

      routePolylineRef.current = polyline;
      const distance = calculateDistance(fromLocation.lat, fromLocation.lng, destination.lat, destination.lng);
      const hours = Math.floor(distance / 60);
      const minutes = Math.round(distance) % 60;

      setRouteInfo({
        distance: `~${distance.toFixed(1)} km`,
        duration: `~${hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}`,
        type: 'estimate'
      });

      createAnimatedMarker(L, [{ lat: fromLocation.lat, lng: fromLocation.lng }, { lat: destination.lat, lng: destination.lng }]);
      setRouteControl({ remove: () => polyline.remove() });
      setIsCalculatingRoute(false);
      setShowRoutePanel(true);
    }
  };

  const createAnimatedMarker = (L: any, coordinates: any[]) => {
    if (!mapRef.current || !coordinates || coordinates.length === 0) return;

    if (animatedMarkerRef.current && mapRef.current) {
      try { mapRef.current.removeLayer(animatedMarkerRef.current); } catch (err) {}
      animatedMarkerRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const vehicleIcon = '🚗';
    const vehicleMarkerHtml = `
      <div class="relative flex items-center justify-center">
        <div class="text-4xl filter drop-shadow-lg animate-bounce">${vehicleIcon}</div>
      </div>
    `;

    const marker = L.marker([coordinates[0].lat, coordinates[0].lng], {
      icon: L.divIcon({ html: vehicleMarkerHtml, className: 'vehicle-marker', iconSize: [40, 40], iconAnchor: [20, 20] }),
      zIndexOffset: 1000
    }).addTo(mapRef.current);

    animatedMarkerRef.current = marker;

    let index = 0;
    const animateMarker = () => {
      if (index < coordinates.length - 1) {
        const start = coordinates[index];
        const end = coordinates[index + 1];
        const steps = 50;
        let step = 0;

        const animate = () => {
          if (step <= steps && marker && animatedMarkerRef.current) {
            const lat = start.lat + (end.lat - start.lat) * (step / steps);
            const lng = start.lng + (end.lng - start.lng) * (step / steps);
            marker.setLatLng([lat, lng]);
            step++;
            animationRef.current = requestAnimationFrame(animate);
          } else {
            index++;
            if (index < coordinates.length - 1) animateMarker();
          }
        };
        animate();
      }
    };
    animateMarker();
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await userAPI.getProfile();
        if (profile.coordinates?.lat && profile.coordinates?.lng) {
          setUserLocation({ lat: profile.coordinates.lat, lng: profile.coordinates.lng });
        }
      } catch (error) {}
    };
    loadUserProfile();
  }, []);

  useEffect(() => {
    clearRoute();
  }, [selectedFriend, selectedTrip]);

  useEffect(() => {
    const fetchTripItinerary = async () => {
      if (!selectedTrip || activeTab !== 'trips') {
        setTripItinerary([]);
        return;
      }
      
      try {
        const stops = await tripAPI.getItinerary(selectedTrip);
        const sortedStops = (stops || []).sort((a: any, b: any) => 
          new Date(a.time).getTime() - new Date(b.time).getTime()
        );
        
        setTripItinerary(sortedStops);
        
        const stopsWithCoords = sortedStops.filter((s: any) => s.lat && s.lng);
        if (stopsWithCoords.length > 0) {
          setElevationLoading(true);
          const locations = stopsWithCoords.map((s: any) => ({ lat: s.lat, lng: s.lng }));
          const elevations = await fetchElevationBatch(locations);
          
          const updatedStops = sortedStops.map((stop: any) => {
            const index = stopsWithCoords.findIndex((s: any) => s._id === stop._id);
            if (index !== -1 && elevations[index] !== null) {
              return { ...stop, elevation: elevations[index] };
            }
            return stop;
          });
          
          setTripItinerary(updatedStops);
          setElevationLoading(false);
        }
      } catch (err) {
        setTripItinerary([]);
        setElevationLoading(false);
      }
    };
    
    fetchTripItinerary();
  }, [selectedTrip, activeTab]);

  const handleTabChange = (tab: 'trips' | 'friends') => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  const handleMyLocation = async () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser');
    
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
          
          userMarkerRef.current = L.marker([latitude, longitude], { 
            icon: L.divIcon({ html: userIconHtml, className: 'user-location-marker', iconSize: [40, 40], iconAnchor: [20, 20] })
          }).addTo(mapRef.current).bindPopup('<div class="text-center p-2 font-bold text-sm">You are here</div>');
          
          mapRef.current.setView([latitude, longitude], 13, { animate: true });
        }
      },
      () => alert('Unable to get your location. Please enable location services.')
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
    tileLayerRef.current = L.tileLayer(layerConfig.url, { attribution: layerConfig.attribution, maxZoom: 19 }).addTo(mapRef.current);
    setCurrentLayer(layer);
    setShowLayerMenu(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (activeTab === 'trips') {
          const data = await tripAPI.getAll();
          
          const tripsWithCoords = data.filter((trip: Trip) => trip.lat && trip.lng);
          if (tripsWithCoords.length > 0) {
            setElevationLoading(true);
            const locations = tripsWithCoords.map((t: Trip) => ({ lat: t.lat!, lng: t.lng! }));
            const elevations = await fetchElevationBatch(locations);
            
            const updatedTrips = data.map((trip: Trip) => {
              const index = tripsWithCoords.findIndex((t: Trip) => t._id === trip._id);
              if (index !== -1 && elevations[index] !== null) {
                return { ...trip, elevation: elevations[index] };
              }
              return trip;
            });
            
            setTrips(updatedTrips);
            setElevationLoading(false);
          } else {
            setTrips(data);
          }
          
          const firstTripWithCoords = data.find((trip: Trip) => trip.lat && trip.lng);
          if (firstTripWithCoords && !selectedTrip) setSelectedTrip(firstTripWithCoords._id);
          else if (data.length > 0 && !selectedTrip) setSelectedTrip(data[0]._id);
        } else {
          const matchedFriends = await matchAPI.getMatches();
          const matchedUsers = matchedFriends.map((match: any) => ({ ...match.user, connectionType: 'match' })).filter(Boolean);
          
          let mutualUsers: any[] = [];
          try {
            const discoverResponse = await matchAPI.discover();
            if (discoverResponse.success && discoverResponse.profiles) {
              mutualUsers = discoverResponse.profiles
                .filter((profile: any) => profile.connectionStatus === 'connected')
                .map((profile: any) => ({ ...profile, _id: profile.id, connectionType: 'mutual' }));
            }
          } catch (e) {}
          
          const matchedIds = new Set(matchedUsers.map((u: any) => u._id || u.id));
          const uniqueMutualUsers = mutualUsers.filter((u: any) => !matchedIds.has(u._id || u.id));
          const allFriends = [...matchedUsers, ...uniqueMutualUsers];
          
          setFriends(allFriends);
          
          const userIdFromUrl = searchParams?.get('user');
          if (userIdFromUrl) {
            const friendFromUrl = allFriends.find((f: any) => f._id === userIdFromUrl || f.id === userIdFromUrl);
            if (friendFromUrl) setSelectedFriend(friendFromUrl._id || friendFromUrl.id);
          } else if (!selectedFriend) {
            const firstWithCoords = allFriends.find((f: any) => f.coordinates?.lat && f.coordinates?.lng);
            if (firstWithCoords) setSelectedFriend(firstWithCoords._id);
          }
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
    const matchesSearch = [trip.title, trip.destination, trip.country].some(val => 
      val.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesFilter = activeFilter === 'All Trips' || trip.status?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredFriends = friends.filter((friend) => 
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    friend.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    for (const key in images) if (dest.includes(key)) return images[key];
    return images.default;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      const container = mapContainerRef.current;
      
      if (!container || (container as any)._leaflet_id) return;

      const map = L.map(container, { center: [20, 0], zoom: 2, zoomControl: false });
      
      const layerConfig = mapLayers[currentLayer];
      tileLayerRef.current = L.tileLayer(layerConfig.url, { attribution: layerConfig.attribution, maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      
      map.on('click', (e: any) => {
        if (!isDrawingModeRef.current) return;
        
        const { lat, lng } = e.latlng;
        const newPoint = { lat, lng };
        
        const markerIcon = L.divIcon({
          html: `<div class="w-6 h-6 bg-green-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold">${drawnPointsRef.current.length + 1}</div>`,
          className: 'custom-draw-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        drawnMarkersRef.current.push(marker);
        
        const updatedPoints = [...drawnPointsRef.current, newPoint];
        drawnPointsRef.current = updatedPoints;
        setDrawnPoints(updatedPoints);
        
        if (tempPolylineRef.current) {
          map.removeLayer(tempPolylineRef.current);
        }
        
        if (updatedPoints.length > 1) {
          const polyline = L.polyline(
            updatedPoints.map(p => [p.lat, p.lng]),
            { color: '#10b981', opacity: 0.6, weight: 4, dashArray: '10, 5' }
          ).addTo(map);
          tempPolylineRef.current = polyline;
        }
      });
      
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

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      if (activeTab === 'trips') {
        const tripsToDisplay = selectedTrip 
          ? filteredTrips.filter(t => t._id === selectedTrip && t.lat && t.lng)
          : filteredTrips.filter(t => t.lat && t.lng);
          
        tripsToDisplay.forEach((trip) => {
          const isSelected = trip._id === selectedTrip;
          const iconHtml = `
            <div class="relative flex items-center justify-center transform transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="${isSelected ? '#059467' : 'rgba(5, 148, 103, 0.9)'}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `;

          const marker = L.marker([trip.lat!, trip.lng!], { 
            icon: L.divIcon({ html: iconHtml, className: 'custom-marker', iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] }) 
          }).addTo(mapRef.current);
          
          const image = trip.imageUrl || getDefaultImage(trip.destination);
          const popupContent = `
            <div class="w-[240px]">
              <div class="h-[120px] w-full bg-cover bg-center relative rounded-t-xl" style="background-image: url('${image}')">
                ${trip.status ? `<div class="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 capitalize shadow-sm">${trip.status}</div>` : ''}
                ${trip.elevation ? `<div class="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="4 14 10 8 14 12 20 6"></polyline>
                  </svg>
                  ${formatElevation(trip.elevation)}
                </div>` : ''}
              </div>
              <div class="p-4 bg-white">
                <h3 class="text-slate-900 text-base font-bold leading-tight truncate">${trip.title}</h3>
                <p class="text-slate-500 text-xs mt-1 font-medium">${formatDates(trip.startDate, trip.endDate)}</p>
                <p class="text-slate-600 text-xs mt-1 truncate mb-3">${trip.destination}, ${trip.country}</p>
                <button 
                  onclick="window.open('https://www.google.com/maps/search/?api=1&query=${trip.lat},${trip.lng}', '_blank')"
                  class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                  Open in Google Maps
                </button>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 240, className: 'custom-popup' });
          if (isSelected) marker.openPopup();
          markersRef.current[trip._id] = marker;
        });

        if (tripsToDisplay.length > 0) {
          if (tripsToDisplay.length === 1 && selectedTrip) {
            const trip = tripsToDisplay[0];
            mapRef.current.setView([trip.lat!, trip.lng!], 13, { animate: true });
          } else {
            const bounds = L.latLngBounds(tripsToDisplay.map((t: Trip) => [t.lat!, t.lng!]));
            const paddingBottom = window.innerWidth < 768 ? (isMobileExpanded ? 400 : 250) : 50;
            mapRef.current.fitBounds(bounds, { paddingBottomRight: [50, paddingBottom], paddingTopLeft: [50, 50], maxZoom: 10 });
          }
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

          const marker = L.marker([friend.coordinates.lat, friend.coordinates.lng], { 
            icon: L.divIcon({ html: iconHtml, className: 'custom-marker', iconSize: [48, 48], iconAnchor: [24, 24], popupAnchor: [0, -24] }) 
          }).addTo(mapRef.current);
          
          const popupContent = `
            <div class="w-[220px] p-4 bg-white rounded-xl">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0">
                  ${friend.profilePicture ? `<img src="${friend.profilePicture}" class="w-full h-full object-cover" />` : `<div class="w-full h-full flex items-center justify-center text-emerald-700 font-bold">${friend.name?.charAt(0).toUpperCase()}</div>`}
                </div>
                <div class="min-w-0">
                  <h3 class="text-slate-900 font-bold truncate">${friend.name}${friend.age ? `, ${friend.age}` : ''}</h3>
                </div>
              </div>
              <p class="text-xs text-slate-600 mb-3 truncate font-medium">${friend.location || 'Unknown location'}</p>
              <button 
                onclick="window.open('https://www.google.com/maps/search/?api=1&query=${friend.coordinates.lat},${friend.coordinates.lng}', '_blank')"
                class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
                Open in Google Maps
              </button>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 220, className: 'custom-popup' });
          if (isSelected) marker.openPopup();
          markersRef.current[friend._id] = marker;
        });

        if (filteredFriends.length > 0 && !showRoutePanel) {
          if (selectedFriend) {
            const selected = filteredFriends.find(f => f._id === selectedFriend);
            if (selected && selected.coordinates?.lat && selected.coordinates?.lng) {
              mapRef.current.setView([selected.coordinates.lat, selected.coordinates.lng], 13, { animate: true });
            }
          } else {
            const coords = filteredFriends.filter(f => f.coordinates?.lat).map(f => [f.coordinates.lat, f.coordinates.lng] as [number, number]);
            if (coords.length > 0) {
              const paddingBottom = window.innerWidth < 768 ? (isMobileExpanded ? 400 : 250) : 50;
              mapRef.current.fitBounds(L.latLngBounds(coords), { paddingBottomRight: [50, paddingBottom], paddingTopLeft: [50, 50], maxZoom: 10 });
            }
          }
        }
      }
    };
    updateMarkers();
  }, [filteredTrips, filteredFriends, selectedTrip, selectedFriend, mapLoaded, activeTab, isMobileExpanded, showRoutePanel]);

  // IMPORTANT FIX: Using an isCancelled flag for Race Conditions and a delay for API rate limits
  useEffect(() => {
    let isCancelled = false;
    
    if (!mapLoaded || !mapRef.current || tripItinerary.length === 0 || activeTab !== 'trips' || !selectedTrip) {
      Object.values(itineraryMarkersRef.current).forEach(marker => {
        try { mapRef.current.removeLayer(marker); } catch (e) {}
      });
      itineraryMarkersRef.current = {};
      
      itineraryRoutesRef.current.forEach(route => {
        try { mapRef.current.removeLayer(route); } catch (e) {}
      });
      itineraryRoutesRef.current = [];
      return;
    }
    
    const displayItineraryStops = async () => {
      if (!mapRef.current) return;
      
      const L = (await import('leaflet')).default;
      if (isCancelled) return;
      
      Object.values(itineraryMarkersRef.current).forEach(marker => {
        try { mapRef.current.removeLayer(marker); } catch (e) {}
      });
      itineraryMarkersRef.current = {};
      
      itineraryRoutesRef.current.forEach(route => {
        try { mapRef.current.removeLayer(route); } catch (e) {}
      });
      itineraryRoutesRef.current = [];
      
      const stopsWithCoords = tripItinerary.filter(stop => stop.lat && stop.lng);
      if (stopsWithCoords.length === 0) return;
      
      stopsWithCoords.forEach((stop, index) => {
        if (!mapRef.current || isCancelled) return;
        
        const dayNumber = index + 1;
        const iconHtml = `
          <div class="relative flex flex-col items-center">
            <div class="bg-[#059467] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg border-3 border-white ring-2 ring-[#059467]/30">
              ${dayNumber}
            </div>
            <div class="absolute -bottom-7 bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-md whitespace-nowrap border border-slate-200">
              ${stop.name.length > 20 ? stop.name.substring(0, 20) + '...' : stop.name}
            </div>
          </div>
        `;
        
        const marker = L.marker([stop.lat, stop.lng], {
          icon: L.divIcon({ html: iconHtml, className: 'itinerary-stop-marker', iconSize: [40, 40], iconAnchor: [20, 20] }),
          zIndexOffset: 500
        }).addTo(mapRef.current);
        
        const popupContent = `
          <div class="p-2">
            <div class="font-bold text-sm text-[#059467] mb-1">Day ${dayNumber}</div>
            <div class="font-bold text-sm mb-1">${stop.name}</div>
            ${stop.activity ? `<div class="text-xs text-slate-600 italic">${stop.activity}</div>` : ''}
            ${stop.elevation ? `<div class="text-xs text-slate-700 mt-1 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 14 10 8 14 12 20 6"></polyline>
              </svg>
              Elevation: ${formatElevation(stop.elevation)}
            </div>` : ''}
            <div class="text-xs text-slate-500 mt-1">${new Date(stop.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
        `;
        marker.bindPopup(popupContent, { maxWidth: 220, className: 'custom-popup' });
        itineraryMarkersRef.current[stop._id] = marker;
      });
      
      for (let i = 0; i < stopsWithCoords.length - 1; i++) {
        if (!mapRef.current || isCancelled) break;
        
        const currentStop = stopsWithCoords[i];
        const nextStop = stopsWithCoords[i + 1];
        
        try {
          // Smart routing heuristic: Under 40km is likely a trek. Over 40km is likely a drive or flight.
          const distanceCheck = calculateDistance(currentStop.lat, currentStop.lng, nextStop.lat, nextStop.lng);
          const routeProfile = distanceCheck < 40 ? 'foot' : 'driving';
          
          const osrmUrl = `https://router.project-osrm.org/route/v1/${routeProfile}/${currentStop.lng},${currentStop.lat};${nextStop.lng},${nextStop.lat}?overview=full&geometries=geojson`;
          
          const response = await fetch(osrmUrl, { signal: AbortSignal.timeout(5000) });
          if (isCancelled) break; // Check again after await
          
          if (!response.ok) throw new Error(`OSRM API returned ${response.status}`);
          
          const data = await response.json();
          if (isCancelled) break; // Check again after await
          
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
            
            const polyline = L.polyline(coordinates, { color: '#ef4444', weight: 4, opacity: 0.8, dashArray: '10, 5' });
            
            if (mapRef.current) {
              polyline.addTo(mapRef.current);
              itineraryRoutesRef.current.push(polyline);
            }
            
            const distanceKm = (route.distance / 1000).toFixed(1);
            const midIndex = Math.floor(coordinates.length / 2);
            const midLat = coordinates[midIndex][0];
            const midLng = coordinates[midIndex][1];
            
            const distanceLabel = L.marker([midLat, midLng], {
              icon: L.divIcon({
                html: `<div class="bg-white px-2 py-1 rounded-full text-[10px] font-bold text-red-500 shadow-md border border-red-500/30">${distanceKm} km</div>`,
                className: 'distance-label',
                iconSize: [60, 20],
                iconAnchor: [30, 10]
              }),
              zIndexOffset: 400
            });
            
            if (mapRef.current) {
              distanceLabel.addTo(mapRef.current);
              itineraryRoutesRef.current.push(distanceLabel);
            }
          } else {
            throw new Error('OSRM routing failed - no valid route');
          }
        } catch (err) {
          if (!mapRef.current || isCancelled) continue;
          
          const polyline = L.polyline(
            [[currentStop.lat, currentStop.lng], [nextStop.lat, nextStop.lng]],
            { color: '#ef4444', weight: 3, opacity: 0.7, dashArray: '10, 5' }
          );
          
          if (mapRef.current) {
            polyline.addTo(mapRef.current);
            itineraryRoutesRef.current.push(polyline);
          }
          
          const distance = calculateDistance(currentStop.lat, currentStop.lng, nextStop.lat, nextStop.lng);
          const midLat = (currentStop.lat + nextStop.lat) / 2;
          const midLng = (currentStop.lng + nextStop.lng) / 2;
          
          const distanceLabel = L.marker([midLat, midLng], {
            icon: L.divIcon({
              html: `<div class="bg-white px-2 py-1 rounded-full text-[10px] font-bold text-red-500 shadow-md border border-red-500/30">~${distance.toFixed(1)} km</div>`,
              className: 'distance-label',
              iconSize: [60, 20],
              iconAnchor: [30, 10]
            }),
            zIndexOffset: 400
          });
          
          if (mapRef.current) {
            distanceLabel.addTo(mapRef.current);
            itineraryRoutesRef.current.push(distanceLabel);
          }
        }
        
        // Anti-Rate Limit Delay: Wait 400ms between OSRM requests to prevent blocking
        if (i < stopsWithCoords.length - 2 && !isCancelled) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }
      
      if (!isCancelled && stopsWithCoords.length > 0 && mapRef.current) {
        const bounds = stopsWithCoords.map(stop => [stop.lat, stop.lng]);
        mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
      }
    };
    
    displayItineraryStops();
    
    // Cleanup function: Safely cancels the async loop if data updates mid-draw
    return () => {
      isCancelled = true;
    };
  }, [tripItinerary, mapLoaded]);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Required to render Leaflet map tiles correctly without broken styling */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      <div className="hidden md:block z-50 relative">
        <Header />
      </div>
      
      <main className="flex-1 relative w-full h-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div ref={mapContainerRef} className="w-full h-full" />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f231d] z-10">
              <div className="text-center flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-slate-900 dark:text-[#059467] animate-spin mb-3" />
                <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Initializing map...</p>
              </div>
            </div>
          )}
        </div>

        <div className={`absolute right-4 md:right-8 flex flex-col gap-3 md:gap-4 items-center z-[40] transition-all duration-300 ${isMobileExpanded ? 'bottom-[calc(80vh+1rem)]' : 'bottom-[calc(35vh+1rem)] md:bottom-8'}`}>
          {/* Desktop Sidebar Toggle - Only visible on desktop */}
          <button 
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="hidden md:flex w-11 h-11 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200/50 items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            title={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
          >
            {isSidebarVisible ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <polyline points="15 9 12 12 15 15"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <polyline points="12 9 15 12 12 15"></polyline>
              </svg>
            )}
          </button>

          <div className="flex flex-col bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <button onClick={() => mapRef.current?.zoomIn()} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
            <div className="h-[1px] w-8 bg-slate-200 dark:bg-slate-700 mx-auto"></div>
            <button onClick={() => mapRef.current?.zoomOut()} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
              <Minus className="w-5 h-5" />
            </button>
          </div>

          <button onClick={handleMyLocation} className="w-11 h-11 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200/50 flex items-center justify-center text-[#059467] hover:bg-[#059467] hover:text-white transition-all group">
            <Navigation className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </button>

          <div className="relative" ref={layerMenuRef}>
            <button onClick={() => setShowLayerMenu(!showLayerMenu)} className="w-11 h-11 bg-slate-900/90 dark:bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-700 flex items-center justify-center text-white dark:text-slate-900 hover:scale-105 transition-all">
              <Layers className="w-5 h-5" />
            </button>
            
            {showLayerMenu && (
              <div className="absolute bottom-full right-0 mb-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 min-w-[150px] animate-in fade-in">
                {Object.entries(mapLayers).map(([key, layer]) => (
                  <button key={key} onClick={() => handleLayerChange(key as any)} className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors flex items-center justify-between ${currentLayer === key ? 'bg-[#059467]/10 text-[#059467]' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <span>{layer.name}</span>
                    {currentLayer === key && <div className="w-2 h-2 rounded-full bg-[#059467]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showRoutePanel && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[45]">
            {isDrawingMode ? (
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 px-4 py-3 animate-in slide-in-from-top">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Drawing Mode</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {drawnPoints.length} point{drawnPoints.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Click on the map to add waypoints for your custom route
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      import('leaflet').then(({ default: L }) => finishManualDrawing(L));
                    }}
                    disabled={drawnPoints.length < 2}
                    className="flex-1 px-3 py-2 bg-[#059467] hover:bg-[#047854] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Finish Route
                  </button>
                  <button 
                    onClick={cancelManualDrawing}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : routeInfo ? (
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 px-4 py-2.5 animate-in slide-in-from-top flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#059467]" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {routeInfo.type === 'road' ? 'Route' : routeInfo.type === 'manual' ? 'Custom' : 'Est.'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Distance:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{routeInfo.distance}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Duration:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{routeInfo.duration}</span>
                  </div>
                </div>
                
                <button 
                  onClick={clearRoute}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors ml-1"
                >
                  <CloseIcon className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            ) : null}
          </div>
        )}

        <aside className={`absolute md:relative left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl z-30 flex flex-col transition-all duration-300 md:h-full border-t md:border-t-0 md:border-r border-slate-200/50 ${isMobileExpanded ? 'bottom-0 h-[80vh] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)]' : 'bottom-0 h-[35vh] md:h-full rounded-t-[2rem] md:rounded-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:shadow-2xl'} ${isSidebarVisible ? 'md:w-[420px]' : 'md:w-0 md:overflow-hidden'}`}>
          <div className="w-full pt-4 pb-2 flex justify-center md:hidden cursor-pointer touch-none" onClick={() => setIsMobileExpanded(!isMobileExpanded)}>
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
          </div>

          <div className="px-5 pt-2 pb-4 flex-shrink-0">
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md p-1 rounded-xl mb-5 border border-slate-200/50">
              <button onClick={() => { handleTabChange('friends'); setSelectedTrip(null); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'friends' ? 'bg-white dark:bg-slate-700 text-[#059467] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                Buddies
              </button>
              <button onClick={() => { handleTabChange('trips'); setSelectedFriend(null); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'trips' ? 'bg-white dark:bg-slate-700 text-[#059467] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                Destinations
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#059467]/30 transition-all"
                placeholder={activeTab === 'friends' ? 'Find travel buddies...' : 'Search locations...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => window.innerWidth < 768 && setIsMobileExpanded(true)}
              />
            </div>
          </div>

          {activeTab === 'trips' && (
            <div className="px-5 pb-3 overflow-x-auto hide-scrollbar flex-shrink-0 border-b border-slate-100">
              <div className="flex gap-2">
                {filters.map((filter) => (
                  <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div 
            className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (activeTab === 'trips') {
                  setSelectedTrip(null);
                } else {
                  setSelectedFriend(null);
                }
              }
            }}
          >
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
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><MapPin className="w-6 h-6 text-slate-400" /></div>
                  <p className="text-slate-500 font-medium mb-4">{trips.length === 0 ? 'Map out your first adventure!' : 'No trips match your search.'}</p>
                  {trips.length === 0 && <button onClick={() => router.push('/trips/new')} className="px-5 py-2.5 bg-[#059467] text-white rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all">Create Trip</button>}
                </div>
              ) : (
                filteredTrips.map((trip) => {
                  const hasLocation = trip.lat && trip.lng;
                  const hasActiveRoute = routeDestinationId === trip._id && routeInfo;
                  return (
                    <div 
                      key={trip._id} 
                      className={`p-3 rounded-2xl border transition-all ${hasLocation ? 'hover:bg-slate-50' : 'opacity-60'} ${selectedTrip === trip._id && hasLocation ? 'border-[#059467] bg-emerald-50/30 ring-1 ring-[#059467]/30 shadow-sm' : 'border-slate-200 bg-white'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-4 items-center">
                        <img 
                          src={trip.imageUrl || getDefaultImage(trip.destination)} 
                          className={`w-16 h-16 shrink-0 rounded-xl object-cover shadow-sm cursor-pointer ${selectedTrip === trip._id ? '' : 'grayscale-[30%]'}`} 
                          alt={trip.title}
                          onClick={() => { if (hasLocation) { setSelectedTrip(trip._id); if (window.innerWidth < 768) setIsMobileExpanded(false); } }}
                        />
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { if (hasLocation) { setSelectedTrip(trip._id); if (window.innerWidth < 768) setIsMobileExpanded(false); } }}>
                          <h4 className="font-bold text-slate-900 truncate text-sm mb-0.5">{trip.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate mb-1.5">{trip.destination}, {trip.country}</p>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">{formatDates(trip.startDate, trip.endDate)}</span>
                            {hasLocation ? (
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold capitalize ${trip.status === 'Completed' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{trip.status || 'Planning'}</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md font-bold">No location</span>
                            )}
                            {selectedTrip === trip._id && tripItinerary.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 bg-[#059467] text-white rounded-md font-bold">
                                {tripItinerary.length} {tripItinerary.length === 1 ? 'stop' : 'stops'}
                              </span>
                            )}
                            {trip.elevation && (
                              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="4 14 10 8 14 12 20 6"></polyline>
                                </svg>
                                {formatElevation(trip.elevation)}
                              </span>
                            )}
                            {hasActiveRoute && (
                              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold">
                                {routeInfo.distance} • {routeInfo.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        {hasLocation && userLocation && (
                          <div className="flex gap-1 items-center">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedTrip(trip._id); 
                                if (routeDestinationId === trip._id && routeInfo) {
                                  clearRoute();
                                } else {
                                  calculateRoute({ lat: trip.lat!, lng: trip.lng! }, trip._id);
                                }
                              }} 
                              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${hasActiveRoute ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                              title={hasActiveRoute ? "Hide directions" : "Get directions"}
                            >
                              <Navigation2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedTrip(trip._id);
                                startManualDrawing();
                              }} 
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors" 
                              title="Draw custom route"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${trip.lat},${trip.lng}`, '_blank'); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Open in Google Maps">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              filteredFriends.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-6 h-6 text-slate-400" /></div>
                  <p className="text-slate-500 font-medium mb-4">{friends.length === 0 ? 'Connect with buddies to see them on the map!' : 'No buddies found.'}</p>
                  {friends.length === 0 && <button onClick={() => router.push('/match')} className="px-5 py-2.5 bg-[#059467] text-white rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all">Discover Buddies</button>}
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const hasLocation = friend.coordinates?.lat && friend.coordinates?.lng;
                  const distance = hasLocation && userLocation ? calculateDistance(userLocation.lat, userLocation.lng, friend.coordinates.lat, friend.coordinates.lng) : null;
                  const isOnline = friend.updatedAt ? (new Date().getTime() - new Date(friend.updatedAt).getTime()) < 5 * 60 * 1000 : false;
                  const hasActiveRoute = routeDestinationId === friend._id && routeInfo;
                  
                  return (
                    <div 
                      key={friend._id} 
                      className={`p-3.5 rounded-2xl border transition-all ${hasLocation ? 'hover:bg-slate-50' : 'opacity-60'} ${selectedFriend === friend._id && hasLocation ? 'border-[#059467] bg-emerald-50/30 ring-1 ring-[#059467]/30 shadow-sm' : 'border-slate-200 bg-white'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-4 items-center">
                        <div className="relative cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => { e.stopPropagation(); router.push(`/profile/${friend.username}`); }}>
                          {friend.profilePicture ? (
                            <img src={friend.profilePicture} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm" alt={friend.name} />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-[#059467] to-teal-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">{friend.name?.charAt(0)}</div>
                          )}
                          <div className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { if (hasLocation) { setSelectedFriend(friend._id); if (window.innerWidth < 768) setIsMobileExpanded(false); } }}>
                          <h4 className="font-bold text-slate-900 text-sm truncate hover:text-[#059467] transition-colors">
                            {friend.name}{friend.age ? `, ${friend.age}` : ''}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1">
                            {hasLocation && <MapPin className="w-3 h-3 text-[#059467]" />} {friend.location || 'Location hidden'}
                          </p>
                          <div className="flex gap-2 flex-wrap mt-1">
                            {distance !== null && <span className="text-[10px] font-bold text-[#059467] bg-emerald-50 inline-block px-1.5 py-0.5 rounded uppercase tracking-wider">{formatDistance(distance)}</span>}
                            {hasActiveRoute && (
                              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold">
                                {routeInfo.distance} • {routeInfo.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 items-center">
                          {hasLocation && userLocation && (
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedFriend(friend._id); 
                                if (routeDestinationId === friend._id && routeInfo) {
                                  clearRoute();
                                } else {
                                  calculateRoute({ lat: friend.coordinates.lat, lng: friend.coordinates.lng }, friend._id);
                                }
                              }} 
                              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${hasActiveRoute ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                              title={hasActiveRoute ? "Hide directions" : "Get directions"}
                            >
                              <Navigation2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasLocation && (
                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${friend.coordinates.lat},${friend.coordinates.lng}`, '_blank'); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Open in Google Maps">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/messages?user=${friend._id}`); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Send message">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
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
        
        .custom-marker { background: transparent; border: none; }
        .user-location-marker { background: transparent; border: none; }
        .vehicle-marker { background: transparent; border: none; }
        .leaflet-container { z-index: 0 !important; background: transparent; }
        .leaflet-pane { z-index: 1 !important; }
        .leaflet-top, .leaflet-bottom { z-index: 2 !important; }
        .custom-popup .leaflet-popup-content-wrapper { padding: 0; border-radius: 1rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255,255,255,0.2); }
        .dark .custom-popup .leaflet-popup-content-wrapper { background-color: #1e293b; border-color: #334155; }
        .custom-popup .leaflet-popup-content { margin: 0; min-width: 200px !important; }
        .custom-popup .leaflet-popup-tip { background: white; }
        .dark .custom-popup .leaflet-popup-tip { background: #1e293b; }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-routing-container { display: none !important; }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .vehicle-marker .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
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
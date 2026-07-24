'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GoogleCoverageMapProps {
  locationName: string;
  radiusKm: number;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyD9r59vIxUjLj3hiICvy9CYbXYbmil0Xb4';

declare global {
  interface Window {
    google: any;
    initGoogleMapCallback?: () => void;
  }
}

export default function GoogleCoverageMap({ locationName, radiusKm }: GoogleCoverageMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const circleInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Load Google Maps Script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          setMapLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    window.initGoogleMapCallback = () => {
      setMapLoaded(true);
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMapCallback&libraries=geometry`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Initialize Map & Geocode Location
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const geocoder = new window.google.maps.Geocoder();
    const targetAddress = locationName && locationName.trim() !== '' ? locationName : 'Kochi, Kerala';

    geocoder.geocode({ address: targetAddress }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const centerPos = results[0].geometry.location;
        setGeoError(null);

        if (!googleMapInstance.current) {
          googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: centerPos,
            zoom: 10,
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
              { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b687a' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
            ],
          });
        } else {
          googleMapInstance.current.setCenter(centerPos);
        }

        // Center Pin Marker
        if (!markerInstance.current) {
          markerInstance.current = new window.google.maps.Marker({
            position: centerPos,
            map: googleMapInstance.current,
            title: `Operational Center: ${targetAddress}`,
            animation: window.google.maps.Animation.DROP,
          });
        } else {
          markerInstance.current.setPosition(centerPos);
        }

        // Blue Geofence Circle Overlay
        const radiusMeters = radiusKm * 1000;
        if (!circleInstance.current) {
          circleInstance.current = new window.google.maps.Circle({
            strokeColor: '#3B82F6', // Electric Blue
            strokeOpacity: 0.95,
            strokeWeight: 2.5,
            fillColor: '#3B82F6', // Blue Translucent Geofence Fill
            fillOpacity: 0.22,
            map: googleMapInstance.current,
            center: centerPos,
            radius: radiusMeters,
          });
        } else {
          circleInstance.current.setCenter(centerPos);
          circleInstance.current.setRadius(radiusMeters);
        }

        // Fit Bounds to fit entire blue geofence circle
        const bounds = circleInstance.current.getBounds();
        if (bounds) {
          googleMapInstance.current.fitBounds(bounds);
        }
      } else {
        setGeoError(`Could not locate region "${targetAddress}". Fallback to default coordinates.`);
      }
    });
  }, [mapLoaded, locationName]);

  // Update Blue Geofence Circle Radius Dynamically when radiusKm changes
  useEffect(() => {
    if (circleInstance.current && window.google && window.google.maps) {
      const radiusMeters = radiusKm * 1000;
      circleInstance.current.setRadius(radiusMeters);
      const bounds = circleInstance.current.getBounds();
      if (bounds && googleMapInstance.current) {
        googleMapInstance.current.fitBounds(bounds);
      }
    }
  }, [radiusKm]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-blue-500/30 bg-slate-950 shadow-2xl">
      {!mapLoaded ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-blue-400 space-y-2">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-semibold text-slate-300">Loading Google Maps Blue Geofence...</span>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}

      {/* Geofence Overlay Badge */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-blue-500/50 text-[11px] font-bold text-blue-400 flex items-center gap-2 backdrop-blur-md shadow-xl pointer-events-none z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
        <span className="text-white">{locationName || 'Kochi, Kerala'}</span>
        <span className="text-blue-400">· {radiusKm} km Blue Fence</span>
      </div>

      {geoError && (
        <div className="absolute bottom-2 left-2 right-2 px-3 py-1 bg-red-500/80 text-white text-[10px] rounded-lg">
          {geoError}
        </div>
      )}
    </div>
  );
}

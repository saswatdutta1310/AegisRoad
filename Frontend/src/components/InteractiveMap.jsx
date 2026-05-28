import React, { useState, useEffect } from 'react';
import { Navigation2 } from 'lucide-react';
import { MapContainer, TileLayer, Popup, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CENTER_LAT = 16.4307;
const CENTER_LNG = 80.6241;

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);
  return null;
}

/** Recalculate tile layout when parent resizes (flex grids, modals, tabs). */
function MapSizeFix() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize({ animate: false });
    fix();
    const t1 = setTimeout(fix, 50);
    const t2 = setTimeout(fix, 300);
    const parent = map.getContainer()?.parentElement;
    const ro = parent ? new ResizeObserver(fix) : null;
    if (parent && ro) ro.observe(parent);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro?.disconnect();
    };
  }, [map]);
  return null;
}

export default function InteractiveMap({
  hazards = [],
  contracts = [],
  activeView = 'hazard',
  onSelectHazard,
  onSelectContract,
  selectedHazardId,
  selectedContractId,
  className = '',
}) {
  const [mapCenter, setMapCenter] = useState([CENTER_LAT, CENTER_LNG]);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [userLocation, setUserLocation] = useState(null);
  const [isLiveLocationActive, setIsLiveLocationActive] = useState(false);

  useEffect(() => {
    if (selectedHazardId) {
      const selectedHazard = hazards.find(h => h.id === selectedHazardId);
      if (selectedHazard?.lat != null && selectedHazard?.lng != null) {
        setMapCenter([selectedHazard.lat, selectedHazard.lng]);
        setZoomLevel(15);
      }
    }
  }, [selectedHazardId, hazards]);

  const handleToggleLiveLocation = () => {
    if (isLiveLocationActive) {
      setIsLiveLocationActive(false);
      setUserLocation(null);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setMapCenter(coords);
          setIsLiveLocationActive(true);
        },
        () => {
          const mockCoords = [CENTER_LAT + 0.01, CENTER_LNG - 0.01];
          setUserLocation(mockCoords);
          setMapCenter(mockCoords);
          setIsLiveLocationActive(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  return (
    <div className={`aegis-map-root ${className}`.trim()}>
      <div className="absolute top-3 right-3 z-[5] flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleLiveLocation}
          className={`h-8 px-3 text-[10px] uppercase font-bold rounded-lg flex items-center justify-center gap-1.5 border cursor-pointer transition-all shadow ${
            isLiveLocationActive
              ? 'bg-sky-950 border-sky-600/80 text-sky-400 animate-pulse font-black'
              : 'bg-slate-900/95 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
          }`}
          title="Toggle GPS position"
        >
          <Navigation2 size={12} className={isLiveLocationActive ? 'fill-sky-400 rotate-45' : ''} />
          <span>{isLiveLocationActive ? 'GPS Locked' : 'Re-Lock GPS'}</span>
        </button>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        className="aegis-map-container"
        style={{ width: '100%', height: '100%', minHeight: '100%' }}
        scrollWheelZoom
      >
        <MapSizeFix />
        <ChangeView center={mapCenter} zoom={zoomLevel} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.5 }}
          >
            <Popup>Your Location</Popup>
          </CircleMarker>
        )}

        {(activeView === 'hazard' || activeView === 'driver') &&
          hazards.map((h) => {
            let color = '#2ea014';
            if (h.severity === 'critical') color = '#f43f5e';
            else if (h.severity === 'high') color = '#f97316';
            else if (h.severity === 'medium') color = '#fbbf24';
            if (h.status === 'completed') color = '#10b981';

            return (
              <CircleMarker
                key={h.id}
                center={[h.lat ?? CENTER_LAT, h.lng ?? CENTER_LNG]}
                radius={selectedHazardId === h.id ? 12 : 8}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
                eventHandlers={{ click: () => onSelectHazard?.(h) }}
              >
                <Popup>
                  <div className="font-sans text-xs min-w-[140px]">
                    <strong>{h.title || h.cls}</strong>
                    <br />
                    {h.location || h.road_name}
                    <br />
                    <span className="text-slate-500">Status: {h.status}</span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {activeView === 'spend' &&
          contracts.map((c) => {
            let x = 30,
              y = 30;
            if (c.sector === 'NH-65') {
              x = 70;
              y = 35;
            } else if (c.sector === 'Industrial Zone') {
              x = 45;
              y = 50;
            } else if (c.sector === 'Metro-02') {
              x = 65;
              y = 78;
            } else if (c.sector === 'Metro-03') {
              x = 20;
              y = 80;
            } else if (c.sector === 'Metro-01') {
              x = 30;
              y = 20;
            }

            const lat = CENTER_LAT + (50 - y) * 0.0006;
            const lng = CENTER_LNG + (x - 50) * 0.0006;
            const color =
              c.efficiencyScore >= 90 ? '#10b981' : c.efficiencyScore < 75 ? '#f43f5e' : '#f59e0b';
            const size = Math.max(15, Math.min(30, c.tenderValue * 2));

            return (
              <CircleMarker
                key={c.id}
                center={[lat, lng]}
                radius={size}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.4 }}
                eventHandlers={{ click: () => onSelectContract?.(c) }}
              >
                <Popup>
                  <div className="font-sans text-xs">
                    <strong>{c.name}</strong>
                    <br />₹{c.tenderValue.toFixed(2)} Cr
                    <br />
                    Efficiency: {c.efficiencyScore}%
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}

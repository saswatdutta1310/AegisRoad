import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, DollarSign, Navigation2, Compass, Layers, Info, ExternalLink } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

// User provided production-ready Google Maps API Key
const API_KEY = 'AIzaSyBXjFA8LKMCU2dWjXEOrTUMZ3hW9GgjXis';
const hasValidKey = true;

// Center location (Hyderabad high-tech area near NH-65 corridor)
const CENTER_LAT = 17.4485;
const CENTER_LNG = 78.3741;

export default function InteractiveMap({
  hazards = [],
  contracts = [],
  activeView = 'hazard', // 'hazard' or 'spend' or 'driver'
  onSelectHazard,
  onSelectContract,
  selectedHazardId,
  selectedContractId,
  driverRouteActive = false
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map mode is always 'google' for real maps and live tracking
  const [mapMode, setMapMode] = useState('google');
  
  // Geolocation and Live Tracking states
  const [userLocation, setUserLocation] = useState(null);
  const [isLiveLocationActive, setIsLiveLocationActive] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: CENTER_LAT, lng: CENTER_LNG });
  
  // Info windows states
  const [infoWindowOpenId, setInfoWindowOpenId] = useState(null);
  const [infoWindowOpenContractId, setInfoWindowOpenContractId] = useState(null);

  // Automatically request/simulate live geotracking sequence on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          setMapCenter(coords);
          setIsLiveLocationActive(true);
        },
        (error) => {
          console.warn("Auto GPS lookup bypassed, defaulting to active simulated location tracker.", error);
          activateMockLocation();
        },
        { enableHighAccuracy: true, timeout: 4000 }
      );
    } else {
      activateMockLocation();
    }
  }, []);

  // Sync selected hazard or contract with map centering
  useEffect(() => {
    if (selectedHazardId) {
      const selectedHazard = hazards.find(h => h.id === selectedHazardId);
      if (selectedHazard) {
        // Center of Google Map
        const lat = CENTER_LAT + (50 - selectedHazard.coordinates.y) * 0.0006;
        const lng = CENTER_LNG + (selectedHazard.coordinates.x - 50) * 0.0006;
        setMapCenter({ lat, lng });
        setInfoWindowOpenId(selectedHazardId);
        setInfoWindowOpenContractId(null);
      }
    }
  }, [selectedHazardId, hazards]);

  useEffect(() => {
    if (selectedContractId) {
      const selectedContract = contracts.find(c => c.id === selectedContractId);
      if (selectedContract) {
        let x = 30;
        let y = 30;
        if (selectedContract.sector === 'NH-65') { x = 70; y = 35; }
        else if (selectedContract.sector === 'Industrial Zone') { x = 45; y = 50; }
        else if (selectedContract.sector === 'Metro-02') { x = 65; y = 78; }
        else if (selectedContract.sector === 'Metro-03') { x = 20; y = 80; }
        else if (selectedContract.sector === 'Metro-01') { x = 30; y = 20; }

        const lat = CENTER_LAT + (50 - y) * 0.0006;
        const lng = CENTER_LNG + (x - 50) * 0.0006;
        setMapCenter({ lat, lng });
        setInfoWindowOpenContractId(selectedContractId);
        setInfoWindowOpenId(null);
      }
    }
  }, [selectedContractId, contracts]);

  // Request browser geolocation to find live user coordinate location
  const handleToggleLiveLocation = () => {
    if (isLiveLocationActive) {
      setIsLiveLocationActive(false);
      setUserLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      activateMockLocation();
      return;
    }

    // Attempting real GPS coordinates
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        setMapCenter(coords);
        setIsLiveLocationActive(true);
      },
      (error) => {
        activateMockLocation();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const activateMockLocation = () => {
    // Generate simulated coordinates around the NH-65 center area
    const mockCoords = {
      lat: CENTER_LAT + 0.0003,
      lng: CENTER_LNG - 0.0004
    };
    setUserLocation(mockCoords);
    setMapCenter(mockCoords);
    setIsLiveLocationActive(true);
  };

  // Styled grid lines and road paths representing real-world geography
  const roadNetwork = [
    { name: "NH65 Downtown Highway Corridor", path: "M 20 40 Q 100 20 180 50 T 360 80 M 20 40 L 380 380", color: "#475569" },
    { name: "Broadway Sector 12 Access Road", path: "M 40 360 L 360 40", color: "#334155" },
    { name: "Riverside Parkway Slip Bypass", path: "M 60 380 C 140 240 240 160 360 340", color: "#1e293b" },
    { name: "Industrial Zone B Boundary", path: "M 20 180 H 380 M 180 20 V 380", color: "#334155" },
    { name: "Expressway Ring Radial Route", path: "M 100 100 Q 300 40 300 300 T 100 300 Z", color: "#475569" }
  ];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoomLevel(1);
    setOffset({ x: 0, y: 0 });
    setMapCenter({ lat: CENTER_LAT, lng: CENTER_LNG });
  };

  const handleMouseDown = (e) => {
    if (mapMode === 'google') return; // let google maps handle normal drag interactions
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (mapMode === 'google' || !isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="relative w-full h-full bg-[#0a0f1d] rounded-xl overflow-hidden border border-slate-800 select-none shadow-inner"
    >
      {/* Dynamic Status Header */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-lg px-3 py-2 pointer-events-none flex flex-col gap-0.5">
        <div className="text-[10px] uppercase text-[#2ea014] font-mono tracking-wider font-extrabold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2ea014] animate-pulse"></span>
          {activeView === 'hazard' ? 'Hazard Telemetry Layer' : activeView === 'spend' ? 'SpendWatch Capital Blobs' : 'Driver GPS Radar Routing'}
        </div>
        <div className="text-xs text-white font-mono font-bold tracking-tight">
          LIVE GOOGLE RADAR TRACKING
        </div>
        {isLiveLocationActive && userLocation && (
          <div className="text-[9px] text-sky-400 font-mono flex items-center gap-1 mt-0.5 bg-sky-950/40 border border-sky-850 px-1 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
            LIVE COORDS: {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
          </div>
        )}
      </div>

      {/* Floating Control Panel (Top-Right Toggle for Maps) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* GPS Live Target Button */}
        <button
          onClick={handleToggleLiveLocation}
          className={`h-8 px-3 text-[10px] uppercase font-bold rounded-lg flex items-center justify-center gap-1.5 border cursor-pointer transition-all shadow ${
            isLiveLocationActive
              ? 'bg-sky-950 border-sky-600/80 text-sky-400 animate-pulse font-black'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
          title="Toggle browser position / GPS simulation locator"
        >
          <Navigation2 size={12} className={isLiveLocationActive ? 'fill-sky-400 rotate-45' : ''} />
          <span>{isLiveLocationActive ? 'GPS Position Locked' : 'Re-Lock GPS'}</span>
        </button>
      </div>

      {/* -------------------- VIEWPORT OVERLAY -------------------- */}
      {/* GOOGLE MAPS LIVE VIEW ONLY */}
      <div className="w-full h-full relative">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            center={mapCenter}
            defaultZoom={15}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {/* Real-time Tracking Pulse Marker */}
            {userLocation && (
              <AdvancedMarker position={userLocation} title="Our Current Coordinates">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-sky-500/30 animate-ping" />
                  <div className="w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-md flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Hazards Pins Layout on Google Maps */}
            {(activeView === 'hazard' || activeView === 'driver') && hazards.map((h) => {
              // Project the 0-100 vector coords near Hyderabad center point
              const lat = CENTER_LAT + (50 - h.coordinates.y) * 0.0006;
              const lng = CENTER_LNG + (h.coordinates.x - 50) * 0.0006;
              const isSelected = selectedHazardId === h.id || infoWindowOpenId === h.id;

              let pinColor = '#2ea014'; // default unassigned
              if (h.severity === 'critical') pinColor = '#f43f5e'; // rose-500
              else if (h.severity === 'high') pinColor = '#f97316'; // orange-500
              else if (h.severity === 'medium') pinColor = '#fbbf24'; // amber-400
              
              if (h.status === 'completed') pinColor = '#10b981'; // emerald-500

              return (
                <React.Fragment key={h.id}>
                  <AdvancedMarker 
                    position={{ lat, lng }} 
                    onClick={() => {
                      if (onSelectHazard) onSelectHazard(h);
                      setInfoWindowOpenId(h.id);
                      setInfoWindowOpenContractId(null);
                    }}
                  >
                    <Pin background={pinColor} glyphColor="#fff" scale={isSelected ? 1.25 : 1.0} />
                  </AdvancedMarker>

                  {infoWindowOpenId === h.id && (
                    <InfoWindow 
                      position={{ lat, lng }} 
                      onCloseClick={() => setInfoWindowOpenId(null)}
                    >
                      <div className="text-slate-900 font-sans p-1 max-w-[200px]">
                        <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                          <span className={`w-2 h-2 rounded-full ${
                            h.severity === 'critical' ? 'bg-rose-500' : h.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                          }`} />
                          <span className="font-mono font-bold uppercase text-slate-500">{h.id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">{h.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">{h.location}</p>
                        <p className="text-[11px] text-slate-600 mt-1.5 border-t border-slate-100 pt-1 italic">{h.description}</p>
                        <div className="mt-2 text-[9px] font-mono flex justify-between text-slate-500 border-t border-slate-100 pt-1">
                          <span>SLA Delay: {h.severity}</span>
                          <span>Status: {h.status}</span>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </React.Fragment>
              );
            })}

            {/* Contracts Clusters Layout on Google Maps */}
            {activeView === 'spend' && contracts.map((c) => {
              let x = 30;
              let y = 30;
              if (c.sector === 'NH-65') { x = 70; y = 35; }
              else if (c.sector === 'Industrial Zone') { x = 45; y = 50; }
              else if (c.sector === 'Metro-02') { x = 65; y = 78; }
              else if (c.sector === 'Metro-03') { x = 20; y = 80; }
              else if (c.sector === 'Metro-01') { x = 30; y = 20; }

              const lat = CENTER_LAT + (50 - y) * 0.0006;
              const lng = CENTER_LNG + (x - 50) * 0.0006;
              const isSelected = selectedContractId === c.id || infoWindowOpenContractId === c.id;

              let strokeColor = '#2ea014';
              let fillColor = 'rgba(46, 160, 20, 0.2)';
              if (c.efficiencyScore >= 90) {
                strokeColor = '#10b981';
                fillColor = 'rgba(16, 185, 129, 0.2)';
              } else if (c.efficiencyScore < 75) {
                strokeColor = '#f43f5e';
                fillColor = 'rgba(244, 63, 94, 0.2)';
              } else if (c.status === 'warning' || c.status === 'delayed') {
                strokeColor = '#f59e0b';
                fillColor = 'rgba(245, 158, 11, 0.2)';
              }

              const size = Math.max(34, Math.min(74, c.tenderValue * 5.5));

              return (
                <React.Fragment key={c.id}>
                  <AdvancedMarker 
                    position={{ lat, lng }}
                    onClick={() => {
                      if (onSelectContract) onSelectContract(c);
                      setInfoWindowOpenContractId(c.id);
                      setInfoWindowOpenId(null);
                    }}
                  >
                    <div 
                      style={{ width: `${size}px`, height: `${size}px`, borderColor: strokeColor, backgroundColor: fillColor }}
                      className={`rounded-full border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected ? 'ring-4 ring-orange-500 scale-110 shadow-lg' : 'hover:scale-105'
                      }`}
                    >
                      <span className="text-[10px] font-black tracking-tight text-white drop-shadow">₹{c.tenderValue.toFixed(1)}Cr</span>
                    </div>
                  </AdvancedMarker>

                  {infoWindowOpenContractId === c.id && (
                    <InfoWindow 
                      position={{ lat, lng }} 
                      onCloseClick={() => setInfoWindowOpenContractId(null)}
                    >
                      <div className="text-slate-900 font-sans p-1 max-w-[210px]">
                        <div className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider">Tender: {c.id}</div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{c.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Contractor: <span className="font-semibold text-slate-700">{c.contractor}</span></p>
                        <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-100 pt-1.5 text-[10px]">
                          <div>
                            <span className="block text-[8px] text-slate-400 font-mono uppercase">Fund Worth</span>
                            <strong className="text-slate-800">₹{c.tenderValue.toFixed(2)} Cr</strong>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 font-mono uppercase">Audit SLA</span>
                            <strong className="text-emerald-600">{c.efficiencyScore}%</strong>
                          </div>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </React.Fragment>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {/* Embedded Legending Box (Bottom Left Glassmorphism) */}
      <div className="absolute left-4 bottom-4 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-lg p-2.5 max-w-[150px] pointer-events-none text-[10px]">
        <div className="text-white font-bold mb-1 border-b border-slate-800 pb-1">Legend Mapping</div>
        {activeView === 'spend' ? (
          <div className="space-y-1 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400 font-mono">Efficiency &gt;85%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-400 font-mono">Efficiency 70-84%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-slate-400 font-mono">SLA Delayed &lt;70%</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              <span className="text-slate-400 font-mono">Critical Danger</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-slate-400 font-mono">High Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#2ea014] rounded-full"></span>
              <span className="text-slate-400 font-mono">Active Resolution</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

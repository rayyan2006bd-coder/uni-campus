import React, { useState } from 'react';
import { MapPin, Navigation, Info, ZoomIn, ZoomOut } from 'lucide-react';

interface CampusPin {
  id: string;
  name: string;
  type: 'dorm' | 'storage' | 'safety' | 'transit' | 'dining' | 'career';
  lat: number;
  lng: number;
  description: string;
}

const CAMPUS_PINS: CampusPin[] = [
  { id: 'ruet-main', name: 'RUET Main Gate Entrance', type: 'transit', lat: 24.3635, lng: 88.6285, description: 'Primary bus terminal & campus entrance in Kazla Gate' },
  { id: 'ruet-kazla', name: 'RUET Kazla Gate 2', type: 'transit', lat: 24.3645, lng: 88.6240, description: 'Western gate connecting directly to the main highway stop' },
  { id: 'ruet-admin', name: 'RUET Administration Block', type: 'career', lat: 24.3621, lng: 88.6280, description: 'Administrative headquarters, student registrar, and engineering department offices' },
  { id: 'ruet-cafe', name: 'RUET Central Cafeteria', type: 'dining', lat: 24.3623, lng: 88.6275, description: 'Central dining zone, meal subscription collection and gym point' },
  { id: 'aporajita-lane', name: 'Aporajita Girls Hostel Area', type: 'dorm', lat: 24.3660, lng: 88.6290, description: 'Dormitory block for women engineering students with highly secure residency controls' },
  { id: 'cold-storage', name: 'CSE/EEE Lab Cold Storage Vault', type: 'storage', lat: 24.3625, lng: 88.6265, description: 'Secure low-temperature lockers for chemistry equipment and student projects etc.' },
  { id: 'safety-store', name: 'RUET Campus Safety Depot', type: 'safety', lat: 24.3638, lng: 88.6282, description: 'Emergency gears, safety goggles, lab apron checkout' },
  { id: 'binodpur', name: 'Binodpur Gate Crossing', type: 'transit', lat: 24.3642, lng: 88.6321, description: 'East exit towards private messy apartments, student book stalls, and pharmacies' },
  { id: 'shaheb-bazar', name: 'Shaheb Bazar Zero Point', type: 'transit', lat: 24.3685, lng: 88.5975, description: 'Rajshahi City Center & main shopping area' },
  { id: 'railgate', name: 'Rajshahi Central Train Station', type: 'transit', lat: 24.3722, lng: 88.6015, description: 'Main rail transport coordinates for long distance transit routes' },
  { id: 'laxmipur', name: 'Laxmipur Medical Junction', type: 'transit', lat: 24.3725, lng: 88.5855, description: 'Major medical zone loop pointing to private dorm rooms' },
  { id: 'upashahar', name: 'Upashahar Sector 2 area', type: 'transit', lat: 24.3785, lng: 88.6110, description: 'Quiet residential area popular for private student mess lodgings' }
];

interface CampusMapProps {
  selectedPinId?: string;
  onSelectPin?: (pin: CampusPin) => void;
  routingFrom?: string;
  routingTo?: string;
}

export default function CampusMap({ selectedPinId, onSelectPin, routingFrom, routingTo }: CampusMapProps) {
  const [activePin, setActivePin] = useState<CampusPin | null>(
    CAMPUS_PINS.find(p => p.id === selectedPinId) || CAMPUS_PINS[0]
  );
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // projection coordinates centered precisely around the wider Rajshahi & RUET Kazla loop
  const getCoordinatesPct = (lat: number, lng: number) => {
    // RUET/Rajshahi loop range: Lat 24.3550 to 24.3820, Lng 88.5800 to 88.6380
    const latMin = 24.3550;
    const latMax = 24.3820;
    const lngMin = 88.5801;
    const lngMax = 88.6380;

    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = 100 - (((lat - latMin) / (latMax - latMin)) * 100);

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const handlePinClick = (pin: CampusPin) => {
    setActivePin(pin);
    if (onSelectPin) {
      onSelectPin(pin);
    }
  };

  const fromPin = CAMPUS_PINS.find(p => p.id === routingFrom);
  const toPin = CAMPUS_PINS.find(p => p.id === routingTo);

  return (
    <div id="campus-map-container" className="bg-white rounded-2xl border border-neutral-150 shadow-xs overflow-hidden flex flex-col md:flex-row h-[420px]">
      {/* Interactive Map Visual Viewport */}
      <div className="flex-1 relative bg-[#F8FAFC] overflow-hidden group">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:24px_24px] opacity-65"></div>
        
        {/* Landmark shapes representation for localized RUET vibes */}
        <div className="absolute top-[20%] left-[15%] px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-xs border border-slate-200/50 font-mono text-[9px] text-[#64748B] shadow-3xs select-none">Laxmipur Medical Loop</div>
        <div className="absolute top-[18%] right-[45%] px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-xs border border-slate-200/50 font-mono text-[9px] text-[#64748B] shadow-3xs select-none">Upashahar Sector Park</div>
        <div className="absolute bottom-[35%] right-[20%] px-4 py-2 rounded-xl bg-blue-50/70 backdrop-blur-xs border border-blue-100 font-mono text-[9px] text-blue-700 font-semibold shadow-3xs select-none">RUET Academic Quad</div>
        <div className="absolute bottom-[40%] right-[3%] px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-xs border border-slate-200/50 font-mono text-[9px] text-[#64748B] shadow-3xs select-none">Binodpur Gate</div>

        {/* Dynamic Route SVG line under pins */}
        {fromPin && toPin && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {(() => {
              const fromPos = getCoordinatesPct(fromPin.lat, fromPin.lng);
              const toPos = getCoordinatesPct(toPin.lat, toPin.lng);
              return (
                <>
                  <path
                    d={`M ${fromPos.x}% ${fromPos.y}% Q ${(fromPos.x + toPos.x) / 2}% ${(fromPos.y + toPos.y) / 2 - 10}% ${toPos.x}% ${toPos.y}%`}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    strokeDasharray="8 5"
                    className="animate-[dash_1.5s_linear_infinite]"
                  />
                  <style>{`
                    @keyframes dash {
                      to {
                        stroke-dashoffset: -13;
                      }
                    }
                  `}</style>
                </>
              );
            })()}
          </svg>
        )}

        {/* Map UI Control Buttons */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-20">
          <button onClick={() => setZoomLevel(prev => Math.min(prev + 10, 150))} className="p-2 bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 rounded-lg flex items-center justify-center transition-all cursor-pointer">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoomLevel(prev => Math.max(prev - 10, 80))} className="p-2 bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 rounded-lg flex items-center justify-center transition-all cursor-pointer">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Location Markers */}
        <div className="absolute inset-0 z-10 transition-transform duration-200" style={{ transform: `scale(${zoomLevel / 100})` }}>
          {CAMPUS_PINS.map(pin => {
            const { x, y } = getCoordinatesPct(pin.lat, pin.lng);
            const isSelected = activePin?.id === pin.id;
            const isStartRoute = routingFrom === pin.id;
            const isEndRoute = routingTo === pin.id;

            return (
              <button
                key={pin.id}
                onClick={() => handlePinClick(pin)}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 hover:scale-115 focus:outline-none cursor-pointer"
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`${pin.name} (${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)})`}
              >
                <div className={`p-2 rounded-full shadow-md flex items-center justify-center transition-all ${
                  isSelected ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110' :
                  isStartRoute ? 'bg-amber-500 text-white ring-3 ring-amber-100' :
                  isEndRoute ? 'bg-emerald-600 text-white ring-3 ring-emerald-100' :
                  'bg-white text-[#1E293B] hover:bg-blue-600 hover:text-white border border-slate-200'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Sidebar panel */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-150 p-5 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-4">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Campus GIS Coordinates</span>
          </div>

          {activePin ? (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-[9px] uppercase font-mono tracking-wider font-bold text-blue-700">
                  {activePin.type} Space
                </span>
                <h3 className="font-display font-bold text-[#1E293B] leading-tight text-sm mt-1.5">{activePin.name}</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">{activePin.description}</p>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 font-mono text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>GPS Latitude</span>
                  <span className="text-[#1E293B] font-bold">{activePin.lat.toFixed(6)}° N</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GPS Longitude</span>
                  <span className="text-[#1E293B] font-bold">{activePin.lng.toFixed(6)}° E</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Select a map pin to view coordinates and routes.</p>
          )}
        </div>

        {/* Dynamic Route Info */}
        <div className="mt-4 pt-3 border-t border-slate-150">
          <div className="flex items-center gap-2 mb-2 text-slate-800">
            <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="font-display font-semibold text-xs">Route Logistics Planner</span>
          </div>
          {fromPin && toPin ? (
            <div className="bg-[#FAFBFD] border border-blue-50 rounded-xl p-3 space-y-1.5">
              <p className="text-[8px] text-slate-400 font-mono uppercase tracking-wider font-bold">Transit Match Link</p>
              <div className="text-xs font-bold text-slate-700 leading-snug">
                {fromPin.name.replace(' Entrance', '')} 
                <span className="text-blue-500 px-1">→</span> 
                {toPin.name.replace(' Entrance', '')}
              </div>
              <p className="text-[10px] text-emerald-600 font-sans font-bold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-505 bg-emerald-500 inline-block animate-ping"></span>
                Route synchronized live
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Plan shuttle transit passes or accommodations on-foot comparison tours in other tabs to display live route trajectories.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Need, Volunteer, NGO, RiskZone } from '@/lib/types';
import { Shield, AlertTriangle, UserPlus, HeartPulse } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet-icons/marker-icon-2x.png',
  iconUrl: '/leaflet-icons/marker-icon.png',
  shadowUrl: '/leaflet-icons/marker-shadow.png',
});

// Custom HTML Icons
const createIcon = (color: string, iconHtml: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 2px solid white; color: white;">
    ${iconHtml}
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const NeedIcon = {
  food: createIcon('#3b82f6', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'),
  water: createIcon('#0ea5e9', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>'),
  medical: createIcon('#ef4444', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>'),
  shelter: createIcon('#10b981', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'),
  rescue: createIcon('#f97316', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>'),
  other: createIcon('#8b5cf6', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>')
};

const VolunteerIcon = createIcon('#10b981', '<span style="font-weight:bold;font-size:12px;">V</span>');
const NGOIcon = createIcon('#f59e0b', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>');

interface LiveMapProps {
  needs: Need[];
  volunteers: Volunteer[];
  ngos: NGO[];
  riskZones?: RiskZone[];
  center?: { lat: number, lng: number };
  zoom?: number;
  interactive?: boolean;
}

export default function LiveMap({ needs, volunteers, ngos, riskZones = [], center = { lat: 26.9124, lng: 75.7873 }, zoom = 12, interactive = true }: LiveMapProps) {
  
  return (
    <div className="w-full h-full relative z-0 rounded-2xl overflow-hidden glass-panel">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#0F1117' }}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Risk Zones */}
        {riskZones.map(zone => (
          <Polygon 
            key={zone.id}
            positions={zone.polygon.map(p => [p.lat, p.lng])}
            color={zone.risk_level === 'red' ? '#E24B4A' : zone.risk_level === 'orange' ? '#EF9F27' : '#10B981'}
            fillOpacity={0.2}
            weight={2}
          >
            <Popup className="glass-popup">
              <div className="p-2">
                <h3 className="font-bold text-lg">{zone.region}</h3>
                <p className="text-sm">Risk Score: {zone.risk_score}/100</p>
                <div className="mt-2 text-xs opacity-70">
                  Forecast for: {new Date(zone.forecast_time).toLocaleString()}
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}

        <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
          {/* Needs */}
          {needs.map(need => (
            need.status !== 'closed' && (
              <Marker 
                key={need.id} 
                position={[need.location.lat, need.location.lng]}
                icon={NeedIcon[need.need_type]}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold uppercase text-xs tracking-wider opacity-60">{need.need_type}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        need.urgency_label === 'critical' ? 'bg-red-500/20 text-red-400' :
                        need.urgency_label === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {need.urgency_label}
                      </span>
                    </div>
                    <p className="font-bold text-lg mb-1">{need.people_affected} people affected</p>
                    {need.description && <p className="text-sm opacity-80 mb-2">{need.description}</p>}
                    <div className="text-xs opacity-60">
                      Reported: {formatDistanceToNow(new Date(need.created_at))} ago
                    </div>
                    {need.triage_score && (
                      <div className="mt-2 text-xs font-mono bg-white/10 px-2 py-1 rounded inline-block">
                        AI Triage Score: {need.triage_score}/100
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Volunteers */}
          {volunteers.map(vol => (
            vol.online && (
              <Marker 
                key={vol.id}
                position={[vol.location.lat, vol.location.lng]}
                icon={VolunteerIcon}
              >
                <Popup>
                  <div className="p-1 min-w-[150px]">
                    <h3 className="font-bold">{vol.name}</h3>
                    <p className="text-xs opacity-70 mb-2">Rating: {vol.rating} ⭐</p>
                    <div className="flex flex-wrap gap-1">
                      {vol.skills.map(s => (
                        <span key={s} className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* NGOs */}
          {ngos.map(ngo => (
            <Marker
              key={ngo.id}
              position={[ngo.hq_location.lat, ngo.hq_location.lng]}
              icon={NGOIcon}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold">{ngo.org_name}</h3>
                  <p className="text-sm mb-1">{ngo.staff_count} Staff Members</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

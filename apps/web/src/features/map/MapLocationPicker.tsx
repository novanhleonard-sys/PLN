import { useEffect, useRef, useState } from 'react';
import { Map, setWorkerUrl, Marker } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(workerUrl);

interface MapLocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, placeName?: string, address?: any) => void;
}

export function MapLocationPicker({ lat, lng, onChange }: MapLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const marker = useRef<Marker | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
        headers: { 'User-Agent': 'Antigravity/1.0' }
      });
      const data = await res.json();
      if (data && data.display_name) {
        onChange(lat, lng, data.display_name, data.address);
      } else {
        onChange(lat, lng);
      }
    } catch (err) {
      console.error("Nominatim reverse failed", err);
      onChange(lat, lng);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    map.current = new Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [lng || 113.9213, lat || -0.7893],
      zoom: lat && lng ? 12 : 4,
    });

    map.current.on('load', () => {
      if (lat && lng) {
        marker.current = new Marker({ draggable: true, color: '#1a7f84', anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map.current!);
        
        marker.current.on('dragend', () => {
          const lngLat = marker.current?.getLngLat();
          if (lngLat) reverseGeocode(lngLat.lat, lngLat.lng);
        });
      }

      map.current!.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        if (!marker.current) {
          marker.current = new Marker({ draggable: true, color: '#1a7f84', anchor: 'bottom' })
            .setLngLat([lng, lat])
            .addTo(map.current!);
          marker.current.on('dragend', () => {
            const lngLat = marker.current?.getLngLat();
            if (lngLat) reverseGeocode(lngLat.lat, lngLat.lng);
          });
        } else {
          marker.current.setLngLat([lng, lat]);
        }
        reverseGeocode(lat, lng);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (map.current && marker.current && lat && lng) {
      const current = marker.current.getLngLat();
      // Only move if it significantly changed to prevent loops
      if (Math.abs(current.lat - lat) > 0.0001 || Math.abs(current.lng - lng) > 0.0001) {
        marker.current.setLngLat([lng, lat]);
        map.current.flyTo({ center: [lng, lat], zoom: 12 });
      }
    }
  }, [lat, lng]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&countrycodes=id`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Nominatim search failed", err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSearch} className="flex items-center gap-2 relative z-10">
        <input 
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Cari nama tempat atau alamat..."
          className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal text-sm font-nunito"
        />
        <button type="submit" className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 font-bold transition-colors">
          Cari
        </button>
      </form>
      
      {results.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-lg max-h-48 overflow-y-auto mb-2 flex flex-col z-20 relative">
          {results.map((r, i) => (
            <button 
              key={i}
              type="button"
              className="text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-100 last:border-b-0 text-sm font-nunito flex flex-col"
              onClick={() => {
                const newLat = parseFloat(r.lat);
                const newLng = parseFloat(r.lon);
                onChange(newLat, newLng, r.display_name);
                setSearch(r.display_name.split(',')[0]);
                setResults([]);
                if (map.current) {
                  map.current.flyTo({ center: [newLng, newLat], zoom: 14 });
                  if (!marker.current) {
                    marker.current = new Marker({ draggable: true, color: '#1a7f84', anchor: 'bottom' })
                      .setLngLat([newLng, newLat])
                      .addTo(map.current);
                    marker.current.on('dragend', () => {
                      const lngLat = marker.current?.getLngLat();
                      if (lngLat) reverseGeocode(lngLat.lat, lngLat.lng);
                    });
                  } else {
                    marker.current.setLngLat([newLng, newLat]);
                  }
                }
              }}
            >
              <span className="font-bold text-stone-800">{r.name || r.display_name.split(',')[0]}</span>
              <span className="text-xs text-stone-500 line-clamp-1">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-stone-200 z-0">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
      <p className="text-xs text-stone-500 font-nunito">Ketuk peta atau geser pin untuk menentukan titik koordinat yang tepat.</p>
    </div>
  );
}

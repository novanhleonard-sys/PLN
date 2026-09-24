import { useEffect, useRef, useState } from 'react';
import { Map, setWorkerUrl, GeoJSONSource } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
setWorkerUrl(workerUrl);

import type { StoryPin } from './useStories';




interface MainMapProps {
  styleType: 'A' | 'B';
  onPinClick: (story: StoryPin) => void;
  searchedLocation?: [number, number] | null;
  stories?: StoryPin[];
}



export function MainMap({ styleType, onPinClick, searchedLocation, stories = [] }: MainMapProps) {
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>(['Init']);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; 

    const m = new Map({
      container: mapContainer.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {},
        layers: []
      },
      center: [116, -2],
      zoom: 4,
      maxZoom: 12,
      minZoom: 3,
      
    });

    map.current = m;

    m.on('error', (e) => setDebugLogs(l => [...l, 'ERR: ' + (e.error?.message || JSON.stringify(e))]));
    m.on('render', () => { const c = m.getCanvas(); if(c && !(window as any)._loggedRender) { (window as any)._loggedRender=true; setDebugLogs(l => [...l, 'RENDER: ' + c.clientWidth + 'x' + c.clientHeight]); } });
    m.on('load', () => {
      // 1. Ocean Background
      m.addLayer({
        id: 'ocean-bg',
        type: 'background',
        paint: {
          'background-color': '#d1f4f9'
        }
      });

      // 2. Data Sources
      m.addSource('provinsi', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addSource('kabkota', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addSource('provinsi-labels', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addSource('kabkota-labels', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

      fetch('/map/provinsi.geojson').then(r => r.json()).then(data => {
        if (!map.current) return;
        const m = map.current;
        (m.getSource('provinsi') as GeoJSONSource).setData(data); setDebugLogs(l => [...l, 'FETCH SUCCESS ' + data.features.length]);
        const labels = {
          type: 'FeatureCollection',
          features: data.features.map((f: any) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [f.properties.centroid_x, f.properties.centroid_y] },
            properties: f.properties
          }))
        };
        (m.getSource('provinsi-labels') as GeoJSONSource).setData(labels as any);
      });

      fetch('/map/kabkota.geojson').then(r => r.json()).then(data => {
        if (!map.current) return;
        const m = map.current;
        (m.getSource('kabkota') as GeoJSONSource).setData(data);
        const labels = {
          type: 'FeatureCollection',
          features: data.features.map((f: any) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [f.properties.centroid_x, f.properties.centroid_y] },
            properties: f.properties
          }))
        };
        (m.getSource('kabkota-labels') as GeoJSONSource).setData(labels as any);
      });

      // 3. Style A Layers
      m.addLayer({
        id: 'prov-shadow',
        type: 'line',
        source: 'provinsi',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#a3d9e0', 'line-width': 12, 'line-blur': 4 }
      });

      m.addLayer({
        id: 'prov-outline-outer',
        type: 'line',
        source: 'provinsi',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#338e9b', 'line-width': 6 }
      });

      m.addLayer({
        id: 'prov-fill',
        type: 'fill',
        source: 'provinsi',
        paint: { 'fill-color': '#fff9ec' }
      });

      m.addLayer({
        id: 'prov-outline-inner',
        type: 'line',
        source: 'provinsi',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#dcb37b', 'line-width': 2 }
      });

      m.addLayer({
        id: 'kabkota-borders',
        type: 'line',
        source: 'kabkota',
        paint: {
          'line-color': '#dcb37b',
          'line-width': 1, // Tipis dari provinsi
          'line-dasharray': [2, 4],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 7, 1]
        }
      });

      // Label Provinsi - Hanya sekali
      m.addLayer({
        id: 'prov-labels',
        type: 'symbol',
        source: 'provinsi-labels',
        layout: {
          'text-field': ['get', 'shapeName'],
          'text-font': ['Open Sans Semibold'], 
          'text-size': 14,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.1,
          'symbol-placement': 'point', // Only one label per feature centroid ideally
          'icon-allow-overlap': false,
          'text-optional': true,
        },
        paint: {
          'text-color': '#a67b5b',
          'text-halo-color': '#fff9ec',
          'text-halo-width': 2
        }
      });

      // Label Kab/Kota - zoom dekat
      m.addLayer({
        id: 'kabkota-labels',
        type: 'symbol',
        source: 'kabkota-labels',
        minzoom: 7,
        layout: {
          'text-field': ['get', 'shapeName'],
          'text-font': ['Open Sans Semibold'], 
          'text-size': 12,
          'symbol-placement': 'point',
          'icon-allow-overlap': false,
          'text-optional': true,
        },
        paint: {
          'text-color': '#8b5a2b',
          'text-halo-color': '#fff9ec',
          'text-halo-width': 1.5
        }
      });
      
      // 4. Style B: Stadia
      const stadiaKey = import.meta.env.VITE_STADIA_MAPS_API_KEY;
      if (stadiaKey) {
        m.addSource('stadia-watercolor', {
          type: 'raster',
          tiles: [
            `https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=${stadiaKey}`
          ],
          tileSize: 256,
          maxzoom: 11,
          attribution: '&copy; Stadia Maps'
        });
        
        m.addLayer({
          id: 'stadia-watercolor-layer',
          type: 'raster',
          source: 'stadia-watercolor',
          maxzoom: 11,
          layout: { visibility: 'none' }
        }, 'prov-shadow'); 
      }

      // Ornaments for Style B removed to prevent missing image crash

      // 5. Story Pins Source (Initialized empty, populated in separate effect)
      m.addSource('story-pins', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      m.addLayer({
        id: 'story-pins-layer',
        type: 'circle',
        source: 'story-pins',
        paint: {
          'circle-radius': 10,
          'circle-color': ['match', ['get', 'tier'], 1, '#FFA500', 2, '#4CAF50', 3, '#2196F3', '#E91E63'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      m.on('click', 'story-pins-layer', (e) => {
        if (!e.features?.[0]) return;
        const props = e.features[0].properties as StoryPin;
        onPinClick(props);
      });

      m.on('mouseenter', 'story-pins-layer', () => {
        m.getCanvas().style.cursor = 'pointer';
      });

      m.on('mouseleave', 'story-pins-layer', () => {
        m.getCanvas().style.cursor = '';
      });

      setLoaded(true); setDebugLogs(l => [...l, 'LOADED SUCCESS']); setTimeout(() => { const feats = m.queryRenderedFeatures(); setDebugLogs(l => [...l, 'VISIBLE FEATS: ' + feats.length]); }, 2000); setTimeout(() => m.resize(), 500);
    });

    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // Handle Style Toggle
  useEffect(() => {
    const m = map.current;
    if (!m || !loaded) return;
    
    const styleALayers = ['ocean-bg', 'prov-shadow', 'prov-outline-outer', 'prov-fill', 'prov-outline-inner', 'prov-labels', 'kabkota-borders', 'kabkota-labels'];
    
    if (styleType === 'A') {
      styleALayers.forEach(l => {
        if (m.getLayer(l)) m.setLayoutProperty(l, 'visibility', 'visible');
      });
      if (m.getLayer('stadia-watercolor-layer')) m.setLayoutProperty('stadia-watercolor-layer', 'visibility', 'none');
      
    } else {
      styleALayers.forEach(l => {
        if (m.getLayer(l)) m.setLayoutProperty(l, 'visibility', 'none');
      });
      if (m.getLayer('stadia-watercolor-layer')) m.setLayoutProperty('stadia-watercolor-layer', 'visibility', 'visible');
      
    }
  }, [styleType, loaded]);

  // Handle searched location focus
  useEffect(() => {
    if (searchedLocation && map.current && loaded) {
      map.current.flyTo({ center: searchedLocation, zoom: 8, duration: 1500 });
    }
  }, [searchedLocation, loaded]);

  useEffect(() => {
    if (map.current && loaded && map.current.getSource('story-pins')) {
      const geojson = {
        type: 'FeatureCollection',
        features: stories.map(s => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
          properties: s
        }))
      };
      (map.current.getSource('story-pins') as GeoJSONSource).setData(geojson as any);
    }
  }, [stories, loaded]);

  return (
    <>
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full z-0 bg-[#d1f4f9]" />
      <div className="absolute bottom-0 left-0 z-[999] bg-black/80 backdrop-blur text-white px-4 py-4 text-xs font-mono pointer-events-none whitespace-pre flex flex-col gap-1"><b>V1.0.2 DIAGNOSTICS:</b>{debugLogs.map((l, i) => <div key={i}>{l}</div>)}</div>
    </>
  );
}







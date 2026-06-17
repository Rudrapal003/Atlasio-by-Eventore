import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Minus } from 'lucide-react';
import type { Vendor } from '@/types';
import { catById } from '@/data/categories';
import type { GeoCenter } from '@/hooks/useFilters';
import styles from './MapCanvas.module.css';

interface Props {
  vendors: Vendor[];
  isInPlan: (id: string) => boolean;
  selectedId: string | null;
  onSelectVendor: (id: string) => void;
  visibleCount: number;
  center: GeoCenter;
}

const DEFAULT_CENTER: [number, number] = [43.6532, -79.3832]; // Toronto — central Canada/USA

/* =========================================================
MapCanvas — Leaflet over OpenStreetMap tiles.
========================================================= */

function buildIcon(v: Vendor, selected: boolean, inPlan: boolean): L.DivIcon {
  const c = catById(v.cat);
  const classes = [
    'v-marker',
    selected ? 'selected' : '',
    inPlan ? 'in-plan' : '',
    v.sponsored ? 'sponsored' : '',
  ].filter(Boolean).join(' ');
  const size = selected ? 42 : 34;
  return L.divIcon({
    className: '',
    html: `<div class="${classes}" style="background:${c.hex};"><span>${c.emoji}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Pan to selected vendor. */
function PanToSelection({ vendors, selectedId }: { vendors: Vendor[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const v = vendors.find((x) => x.id === selectedId);
    if (!v) return;
    map.panTo([v.lat, v.lng], { animate: true, duration: 0.3 });
  }, [selectedId, vendors, map]);
  return null;
}

/** Pan to user's center when it changes. */
function PanToCenter({ center }: { center: GeoCenter }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo([center.lat, center.lng], 11, { animate: true, duration: 0.8 });
  }, [center, map]);
  return null;
}

/** Floating zoom controls. */
function ZoomControls({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  return (
    <div className={`${styles.zoom} floatCard`} role="group" aria-label="Map zoom">
      <button
        type="button"
        className={styles.zoomBtn}
        onClick={() => mapRef.current?.zoomIn()}
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus size={16} />
      </button>
      <div className={styles.zoomDivider} />
      <button
        type="button"
        className={styles.zoomBtn}
        onClick={() => mapRef.current?.zoomOut()}
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}

export function MapCanvas({
  vendors, isInPlan, selectedId, onSelectVendor, visibleCount, center,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);

  const markers = useMemo(() => vendors.map((v) => {
    const icon = buildIcon(v, v.id === selectedId, isInPlan(v.id));
    return (
      <Marker
        key={v.id + (v.id === selectedId ? '-sel' : '') + (isInPlan(v.id) ? '-ip' : '')}
        position={[v.lat, v.lng]}
        icon={icon}
        eventHandlers={{ click: () => onSelectVendor(v.id) }}
      >
        <Tooltip direction="top" offset={[0, -16]} className="marker-tip">{v.name}</Tooltip>
      </Marker>
    );
  }), [vendors, selectedId, isInPlan, onSelectVendor]);

  return (
    <>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={4}
        zoomSnap={0.5}
        zoomControl={false}
        ref={mapRef}
        className={styles.map}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          maxZoom={19}
        />
        {markers}
        <PanToSelection vendors={vendors} selectedId={selectedId} />
        <PanToCenter center={center} />
      </MapContainer>

      <ZoomControls mapRef={mapRef} />

      <div className={`${styles.corner} floatCard`}>
        <b>{visibleCount}</b> vendors on map
      </div>
    </>
  );
}

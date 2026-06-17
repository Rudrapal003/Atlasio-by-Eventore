import { useState } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import type { Vendor } from '@/types';
import styles from './LocationPicker.module.css';

export interface CityOption {
  name: string;
  label: string;
  lat: number;
  lng: number;
  count: number;
}

interface Props {
  vendors: Vendor[];
  onSelect: (center: { lat: number; lng: number }, cityName: string) => void;
  onSkip: () => void;
}

/** Top cities by vendor count — computed from actual vendor data */
function topCities(vendors: Vendor[]): CityOption[] {
  const cityMap: Record<string, { lat: number; lng: number; count: number }> = {};
  for (const v of vendors) {
    const key = v.area;
    if (!cityMap[key]) {
      cityMap[key] = { lat: v.lat, lng: v.lng, count: 0 };
    }
    cityMap[key].count++;
  }
  return Object.entries(cityMap)
    .map(([name, d]) => ({ name, label: name, lat: d.lat, lng: d.lng, count: d.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function LocationPicker({ vendors, onSelect, onSkip }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cities = topCities(vendors);

  function requestGeo() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onSelect({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 'My Location');
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setError('Location access denied. Please choose a city below.');
        } else {
          setError('Could not get your location. Please choose a city below.');
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.title}>
          <MapPin size={20} color="var(--rose)" />
          Where are you planning?
        </div>
        <p className={styles.sub}>
          We'll show vendors near you — or pick a city to explore.
        </p>

        <button className={styles.geoBtn} onClick={requestGeo} disabled={loading}>
          <Navigation size={16} />
          {loading ? 'Getting your location…' : 'Use my current location'}
        </button>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.divider}>or choose a city</div>

        <div className={styles.cityList}>
          {cities.map((c) => (
            <button
              key={c.name}
              className={styles.cityBtn}
              onClick={() => onSelect({ lat: c.lat, lng: c.lng }, c.name)}
            >
              <span className={styles.cityName}>{c.name}</span>
              <span className={styles.cityMeta}>
                <span className={styles.badge}>{c.count} vendors</span>
              </span>
            </button>
          ))}
        </div>

        <button className={styles.skipBtn} onClick={onSkip}>
          Skip — browse all vendors
        </button>
      </div>
    </div>
  );
}

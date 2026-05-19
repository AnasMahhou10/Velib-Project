'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AppNavLink from '@/components/AppNavLink';
import type { MapStation } from '@/components/StationsMap';
import DepartureDateTimePicker from '@/components/DepartureDateTimePicker';

const StationsMap = dynamic(() => import('@/components/StationsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
      Initialisation de la carte…
    </div>
  ),
});

type Station = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

type Bounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };

const ARR_CENTERS: Record<string, [number, number]> = {
  '1er': [48.86, 2.34],
  '2e': [48.87, 2.34],
  '3e': [48.865, 2.36],
  '4e': [48.855, 2.36],
  '5e': [48.845, 2.35],
  '6e': [48.848, 2.33],
  '7e': [48.858, 2.32],
  '8e': [48.875, 2.31],
  '9e': [48.88, 2.34],
  '10e': [48.875, 2.36],
  '11e': [48.86, 2.38],
  '12e': [48.84, 2.39],
  '13e': [48.83, 2.36],
  '14e': [48.835, 2.33],
  '15e': [48.842, 2.3],
  '16e': [48.865, 2.27],
  '17e': [48.885, 2.32],
  '18e': [48.89, 2.35],
  '19e': [48.885, 2.38],
  '20e': [48.865, 2.4],
};

const ARR_OPTIONS = Object.keys(ARR_CENTERS);

function boundsForArrondissement(arr: string): Bounds | null {
  const center = ARR_CENTERS[arr];
  if (!center) return null;
  const [lat, lng] = center;
  return {
    minLat: lat - 0.012,
    maxLat: lat + 0.012,
    minLng: lng - 0.018,
    maxLng: lng + 0.018,
  };
}

const ARR_BOUNDS: Record<string, Bounds> = Object.fromEntries(
  ARR_OPTIONS.map((arr) => [arr, boundsForArrondissement(arr)!]),
);

function isInArrondissement(station: Station, arr: string) {
  const b = ARR_BOUNDS[arr];
  if (!b) return false;
  return (
    station.lat >= b.minLat &&
    station.lat <= b.maxLat &&
    station.lng >= b.minLng &&
    station.lng <= b.maxLng
  );
}

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522];

function normalizeStation(raw: Record<string, unknown>): Station {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    lat: Number(raw.lat),
    lng: Number(raw.lng),
  };
}

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'start' | 'end'>('start');
  const [startStation, setStartStation] = useState<Station | null>(null);
  const [endStation, setEndStation] = useState<Station | null>(null);
  const [selectedArrondissement, setSelectedArrondissement] = useState<string>('');
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    async function fetchStations() {
      try {
        const res = await fetch('/api/stations', { cache: 'no-store' });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error ?? 'Erreur lors du chargement des stations',
          );
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error('Réponse invalide du serveur (stations attendues).');
        }
        if (active) {
          setStations(
            data.map((row) =>
              normalizeStation(row as Record<string, unknown>),
            ),
          );
          setError(null);
        }
      } catch (e: unknown) {
        if (!active) return;
        const err = e as { name?: string; message?: string };
        setError(err.message ?? 'Erreur inconnue');
      } finally {
        window.clearTimeout(timeoutId);
        setLoading(false);
      }
    }

    fetchStations();

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const markers = useMemo(() => {
    if (!selectedArrondissement) return [] as Station[];

    const inArrondissement = stations.filter((s) =>
      isInArrondissement(s, selectedArrondissement),
    );
    const byId = new Map(inArrondissement.map((s) => [s.id, s]));

    // Garder le départ visible même dans un autre arrondissement
    if (startStation && !byId.has(startStation.id)) {
      byId.set(startStation.id, startStation);
    }
    if (endStation && !byId.has(endStation.id)) {
      byId.set(endStation.id, endStation);
    }

    return Array.from(byId.values());
  }, [stations, selectedArrondissement, startStation, endStation]);

  const center = useMemo<[number, number]>(() => {
    if (selectedArrondissement && ARR_CENTERS[selectedArrondissement]) {
      return ARR_CENTERS[selectedArrondissement];
    }
    return DEFAULT_CENTER;
  }, [selectedArrondissement]);

  const mapZoom = selectedArrondissement ? 14 : 12;

  function handleArrondissementChange(value: string) {
    setSelectedArrondissement(value);

    if (startStation) {
      // Départ déjà choisi : on change juste la zone pour l'arrivée
      setMode('end');
      setEndStation(null);
      return;
    }

    setStartStation(null);
    setEndStation(null);
    setMode('start');
  }

  const handleSelectStation = useCallback((station: MapStation) => {
    if (mode === 'start') {
      setStartStation(station);
      setMode('end');
    } else {
      setEndStation(station);
    }
    const el = document.getElementById('create-ride-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mode]);

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="app-header flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Velib Ride Planner
        </h1>
        <AppNavLink
          href="/rides"
          className="rounded-full border border-sky-300/35 bg-sky-950/50 px-4 py-1 text-sm font-medium text-sky-100 backdrop-blur-sm transition-colors hover:bg-sky-900/60"
        >
          Mes balades
        </AppNavLink>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row">
        <section className="flex-1 p-4 lg:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Carte des stations</h2>
              <p className="text-sm text-zinc-400">
                Choisis un arrondissement pour le départ, puis change
                d&apos;arrondissement si besoin pour choisir l&apos;arrivée.
              </p>
            </div>
            <div className="flex flex-col gap-1 sm:min-w-[200px]">
              <label className="text-xs font-medium text-zinc-300">
                Arrondissement à afficher
              </label>
              <select
                value={selectedArrondissement}
                onChange={(e) => handleArrondissementChange(e.target.value)}
                className="app-input rounded-md px-3 py-2 text-sm outline-none ring-0"
              >
                <option value="">— Choisir un arrondissement —</option>
                {ARR_OPTIONS.map((arr) => (
                  <option key={arr} value={arr}>
                    {arr} arrondissement
                  </option>
                ))}
              </select>
              {loading ? (
                <span className="text-[10px] text-zinc-500">
                  Chargement des stations...
                </span>
              ) : selectedArrondissement ? (
                <span className="text-[10px] text-zinc-500">
                  {markers.length} station{markers.length !== 1 ? 's' : ''}{' '}
                  affichée{markers.length !== 1 ? 's' : ''}
                  {mode === 'end' && startStation && ' — sélectionne l’arrivée'}
                  {markers.length === 0 &&
                    ' (aucune dans cette zone — essaie un autre arrondissement)'}
                </span>
              ) : (
                <span className="text-[10px] text-zinc-500">
                  {stations.length} stations en base — choisis un arrondissement
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="app-map-frame relative h-[500px] w-full overflow-hidden rounded-xl">
            {!selectedArrondissement && !loading && (
              <div className="app-overlay pointer-events-none absolute inset-0 z-[500] flex items-center justify-center px-4 text-center text-sm text-sky-50">
                Sélectionne un arrondissement dans la liste pour afficher les
                stations Velib sur la carte.
              </div>
            )}
            {mapReady ? (
              <StationsMap
                key={selectedArrondissement || 'paris'}
                center={center}
                zoom={mapZoom}
                markers={selectedArrondissement ? markers : []}
                mode={mode}
                onSelectStation={handleSelectStation}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                Initialisation de la carte…
              </div>
            )}
          </div>
        </section>

        <section className="app-sidebar w-full border-t p-4 lg:w-[380px] lg:border-l lg:border-t-0 lg:p-6">
          <h2 className="mb-3 text-lg font-semibold">Créer une nouvelle balade</h2>
          <p className="mb-4 text-sm text-zinc-400">
            1) Choisis une station de départ.&nbsp;
            2) Change d&apos;arrondissement si besoin, puis choisis l&apos;arrivée.
          </p>

          <RideForm
            mode={mode}
            selectedStart={startStation}
            selectedEnd={endStation}
            selectedArrondissement={selectedArrondissement}
            onModeChange={setMode}
          />
        </section>
      </main>
    </div>
  );
}

const CURRENT_USER_ID = 1;

type RideFormProps = {
  mode: 'start' | 'end';
  selectedStart: Station | null;
  selectedEnd: Station | null;
  selectedArrondissement: string;
  onModeChange: (mode: 'start' | 'end') => void;
};

function RideForm({
  mode,
  selectedStart,
  selectedEnd,
  selectedArrondissement,
  onModeChange,
}: RideFormProps) {
  const [title, setTitle] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [stationIdInput, setStationIdInput] = useState('');
  const [endStationIdInput, setEndStationIdInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStart) {
      setStationIdInput(String(selectedStart.id));
    }
  }, [selectedStart]);

  useEffect(() => {
    if (selectedEnd) {
      setEndStationIdInput(String(selectedEnd.id));
    }
  }, [selectedEnd]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const startStationId = Number(stationIdInput);
      const endStationId = Number(endStationIdInput);

      if (!title || !departureTime || !startStationId || !endStationId) {
        setError('Merci de remplir tous les champs.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/ride-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          departureTime: new Date(departureTime).toISOString(),
          creatorId: CURRENT_USER_ID,
          startStationId,
          endStationId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Erreur lors de la création de la balade.');
      }

      setMessage('Balade créée avec succès !');
      setTitle('');
      setDepartureTime('');
      setEndStationIdInput('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      id="create-ride-form"
      onSubmit={handleSubmit}
      className="app-card space-y-4 rounded-xl p-4 text-sm"
    >
      <div className="space-y-1.5">
        <div className="app-card-muted rounded-md px-3 py-2 text-xs text-sky-50">
          <div className="font-semibold mb-1">Résumé</div>
          <div>
            Départ :{' '}
            {selectedStart ? (
              <>
                <span className="font-semibold">{selectedStart.name}</span> (ID{' '}
                {selectedStart.id})
              </>
            ) : (
              <span className="text-zinc-400">non sélectionné</span>
            )}
          </div>
          <div>
            Arrivée :{' '}
            {selectedEnd ? (
              <>
                <span className="font-semibold">{selectedEnd.name}</span> (ID{' '}
                {selectedEnd.id})
              </>
            ) : (
              <span className="text-zinc-400">non sélectionnée</span>
            )}
          </div>
          <div className="mt-1 text-[10px] text-zinc-500">
            Arrondissement :{' '}
            {selectedArrondissement ? (
              <span className="font-medium text-zinc-300">{selectedArrondissement}</span>
            ) : (
              <span className="text-zinc-400">choisis-le au-dessus de la carte</span>
            )}
          </div>
          <div className="mt-1 text-[10px] text-zinc-500">
            Mode actuel : {mode === 'start' ? 'sélection du départ' : "sélection de l’arrivée"}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-zinc-300">
          Titre de la balade
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sprint de nuit, Chill le long de la Seine..."
          className="app-input w-full rounded-md px-3 py-2 text-xs outline-none ring-0"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-zinc-300">
          Date / Heure de départ
        </label>
        <DepartureDateTimePicker
          value={departureTime}
          onChange={setDepartureTime}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-zinc-300">
          Station de départ (ID)
        </label>
        <input
          type="number"
          value={stationIdInput}
          onChange={(e) => setStationIdInput(e.target.value)}
          placeholder="Identifiant Velib de la station"
          className="app-input w-full rounded-md px-3 py-2 text-xs outline-none ring-0"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-zinc-300">
          Station d&apos;arrivée (ID)
        </label>
        <input
          type="number"
          value={endStationIdInput}
          onChange={(e) => setEndStationIdInput(e.target.value)}
          placeholder="Identifiant Velib de la station d'arrivée"
          className="app-input w-full rounded-md px-3 py-2 text-xs outline-none ring-0"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs text-sky-100">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-md bg-sky-500 px-3 py-2 text-xs font-semibold text-sky-950 shadow hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {submitting ? 'Création en cours...' : 'Créer la balade'}
      </button>
    </form>
  );
}


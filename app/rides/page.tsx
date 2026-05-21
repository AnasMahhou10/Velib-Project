'use client';

import { useEffect, useMemo, useState } from 'react';
import AppNavLink from '@/components/AppNavLink';
import AuthNav from '@/components/AuthNav';
import { useAuth } from '@/components/AuthProvider';
import StatsCharts from '@/components/StatsCharts';
import { sumMetrics } from '@/lib/enrichRide';
import {
  distanceLabel,
  formatCalories,
  formatDistance,
  type RideMetrics,
} from '@/lib/rideMetrics';

type RideGroup = {
  id: number;
  title: string;
  departureTime: string;
  startStation: {
    id: number;
    name: string;
    lat?: number;
    lng?: number;
  };
  endStation?: {
    id: number;
    name: string;
    lat?: number;
    lng?: number;
  } | null;
  creator: {
    id: number;
    username: string;
  };
  participants: {
    userId: number;
    user: {
      id: number;
      username: string;
    };
  }[];
  metrics: RideMetrics | null;
};

type Tab = 'upcoming' | 'past' | 'stats';

function isJoined(ride: RideGroup, userId: number | undefined) {
  if (!userId) return false;
  return ride.participants?.some((p) => p.userId === userId) ?? false;
}

function isPast(ride: RideGroup) {
  return new Date(ride.departureTime).getTime() < Date.now();
}

function isMyRide(ride: RideGroup, userId: number | undefined) {
  if (!userId) return false;
  return (
    ride.creator?.id === userId ||
    ride.participants?.some((p) => p.userId === userId)
  );
}

function MetricsPills({
  metrics,
  compact = false,
}: {
  metrics: RideMetrics | null;
  compact?: boolean;
}) {
  if (!metrics) {
    return (
      <span className="text-[10px] text-zinc-500">Distance non calculable</span>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? '' : 'mt-1'}`}>
      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-200">
        {formatDistance(metrics.distanceKm)}
      </span>
      <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-[10px] font-medium text-orange-200">
        {formatCalories(metrics.calories)}
      </span>
      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
        ~{metrics.estimatedMinutes} min
      </span>
      {!compact && (
        <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-200">
          {distanceLabel(metrics.distanceKm)}
        </span>
      )}
    </div>
  );
}

function formatDeparture(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sectionLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfRide = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfRide.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Demain';
  if (diffDays > 1 && diffDays <= 7) return 'Cette semaine';
  return 'Plus tard';
}

function groupBySection(rides: RideGroup[]) {
  const order = ["Aujourd'hui", 'Demain', 'Cette semaine', 'Plus tard'];
  const groups = new Map<string, RideGroup[]>();

  for (const ride of rides) {
    const label = sectionLabel(ride.departureTime);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(ride);
  }

  return order
    .filter((label) => groups.has(label))
    .map((label) => ({ label, rides: groups.get(label)! }));
}

function RideCardSkeleton() {
  return (
    <div className="app-card animate-pulse rounded-xl p-4">
      <div className="h-4 w-1/3 rounded bg-sky-400/20" />
      <div className="mt-3 h-3 w-2/3 rounded bg-sky-400/20" />
      <div className="mt-2 h-3 w-1/2 rounded bg-sky-400/20" />
    </div>
  );
}

function RideCard({
  ride,
  joiningId,
  onJoin,
  currentUserId,
  isLoggedIn,
  compact = false,
}: {
  ride: RideGroup;
  joiningId: number | null;
  onJoin: (id: number) => void;
  currentUserId: number | undefined;
  isLoggedIn: boolean;
  compact?: boolean;
}) {
  const joined = isJoined(ride, currentUserId);
  const past = isPast(ride);
  const isCreator = currentUserId != null && ride.creator?.id === currentUserId;
  const participantCount = ride.participants?.length ?? 0;
  const names = ride.participants?.map((p) => p.user.username) ?? [];

  return (
    <article
      className={`app-card rounded-xl transition-colors ${
        joined
          ? 'border-cyan-300/50 ring-1 ring-sky-400/40'
          : 'hover:border-sky-200/40'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className={`flex gap-3 ${compact ? 'flex-col' : 'flex-col sm:flex-row sm:items-start sm:justify-between'}`}>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-semibold text-zinc-50 ${compact ? 'text-sm' : 'text-base'}`}>
              {ride.title}
            </h3>
            {joined && (
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-200">
                Inscrit
              </span>
            )}
            {past && (
              <span className="rounded-full bg-zinc-700/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                Terminée
              </span>
            )}
            {isCreator && (
              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                Organisateur
              </span>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-zinc-400">
            <span className="mt-0.5 shrink-0 text-zinc-500" aria-hidden>
              📅
            </span>
            <span>{formatDeparture(ride.departureTime)}</span>
          </div>

          <div className="flex items-start gap-2 text-xs text-zinc-400">
            <span className="mt-0.5 shrink-0 text-zinc-500" aria-hidden>
              🚲
            </span>
            <span>
              <span className="font-medium text-zinc-200">
                {ride.startStation?.name ?? 'Station inconnue'}
              </span>
              <span className="mx-1.5 text-zinc-600">→</span>
              <span className="font-medium text-zinc-200">
                {ride.endStation?.name ?? 'Station inconnue'}
              </span>
            </span>
          </div>

          <MetricsPills metrics={ride.metrics} compact={compact} />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
            <span>
              Par{' '}
              <span className="text-zinc-300">
                {ride.creator?.username ?? `user #${ride.creator?.id}`}
              </span>
            </span>
            <span className="text-zinc-600">·</span>
            <span>
              👥 {participantCount} participant{participantCount !== 1 ? 's' : ''}
            </span>
          </div>

          {!compact && names.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {names.slice(0, 5).map((name) => (
                <span
                  key={name}
                  className="rounded-md bg-sky-950/80 px-2 py-0.5 text-[10px] text-sky-100"
                >
                  {name}
                </span>
              ))}
              {names.length > 5 && (
                <span className="rounded-md bg-sky-950/80 px-2 py-0.5 text-[10px] text-sky-200">
                  +{names.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            {joined ? (
              <span className="inline-flex items-center justify-center rounded-md border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-200">
                Déjà inscrit
              </span>
            ) : past ? (
              <span className="inline-flex items-center justify-center rounded-md border border-sky-500/40 bg-sky-950/60 px-3 py-1.5 text-xs text-sky-200">
                Balade passée
              </span>
            ) : !isLoggedIn ? (
              <AppNavLink
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-sky-300/40 bg-sky-950/60 px-4 py-2 text-xs font-medium text-sky-100 hover:bg-sky-900/60"
              >
                Se connecter
              </AppNavLink>
            ) : (
              <button
                type="button"
                onClick={() => onJoin(ride.id)}
                disabled={joiningId === ride.id}
                className="rounded-md bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow hover:from-cyan-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                {joiningId === ride.id ? 'Inscription…' : 'Rejoindre'}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function StatsTabPanel({
  myRides,
  myTotals,
  loading,
}: {
  myRides: RideGroup[];
  myTotals: ReturnType<typeof sumMetrics>;
  loading: boolean;
}) {
  const avgKm =
    myTotals.countWithMetrics > 0
      ? Math.round((myTotals.totalKm / myTotals.countWithMetrics) * 10) / 10
      : 0;

  if (loading) {
    return (
      <div className="space-y-3">
        <RideCardSkeleton />
        <RideCardSkeleton />
      </div>
    );
  }

  if (myRides.length === 0) {
    return (
      <div className="rounded-xl app-card-muted border border-dashed border-white/20 px-6 py-12 text-center">
        <p className="text-sm font-medium text-zinc-300">
          Aucune statistique pour l&apos;instant
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Rejoins ou crée une balade pour voir distance et calories estimées.
        </p>
        <AppNavLink
          href="/"
          className="mt-4 inline-block rounded-md bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-90 transition-opacity"
        >
          Aller à la carte
        </AppNavLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-sky-600/40 via-cyan-600/25 to-blue-900/30 p-6 shadow-lg shadow-sky-950/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl" aria-hidden>
            📊
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-sky-50">
            Statistiques &amp; activité
          </h2>
          <span className="rounded-full border border-cyan-300/40 bg-cyan-500/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-100">
            Estimations auto
          </span>
        </div>
        <p className="mt-2 max-w-xl text-sm text-zinc-300">
          Distance, calories et graphiques calculés depuis tes stations de
          départ et d&apos;arrivée.
        </p>
      </div>

      <div className="app-card-strong rounded-xl bg-gradient-to-br from-sky-800/50 to-cyan-900/30 p-5">
        <h3 className="text-sm font-semibold text-sky-100">Résumé chiffré</h3>
        <p className="mt-1 text-xs text-zinc-400">
          Estimations basées sur la distance départ → arrivée (×1,25 pour les
          rues) · ~30 kcal/km · ~14 km/h
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase text-zinc-500">Distance</p>
            <p className="text-xl font-bold text-amber-200">
              {formatDistance(Math.round(myTotals.totalKm * 10) / 10)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500">Calories</p>
            <p className="text-xl font-bold text-orange-200">
              {formatCalories(myTotals.totalCalories)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500">Temps vélo</p>
            <p className="text-xl font-bold text-zinc-100">
              ~{myTotals.totalMinutes} min
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500">Moyenne</p>
            <p className="text-xl font-bold text-sky-200">
              {formatDistance(avgKm)}
            </p>
          </div>
        </div>
        {myTotals.longestKm > 0 && (
          <p className="mt-3 text-xs text-zinc-400">
            Plus longue balade :{' '}
            <span className="font-medium text-zinc-200">
              {formatDistance(myTotals.longestKm)}
            </span>
          </p>
        )}
      </div>

      <StatsCharts
        rides={myRides}
        totalKm={myTotals.totalKm}
        totalCalories={myTotals.totalCalories}
      />

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Détail par balade
        </h3>
        <div className="app-card overflow-hidden rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-950/60 text-sky-200">
              <tr>
                <th className="px-3 py-2 font-medium">Balade</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">
                  Date
                </th>
                <th className="px-3 py-2 font-medium">Distance</th>
                <th className="px-3 py-2 font-medium">Kcal</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">
                  Durée
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-400/15 bg-sky-950/40">
              {myRides.map((ride) => (
                <tr key={ride.id} className="hover:bg-sky-800/30">
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-zinc-100">{ride.title}</div>
                    <div className="mt-0.5 truncate text-[10px] text-zinc-500">
                      {ride.startStation?.name} → {ride.endStation?.name}
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-zinc-400 sm:table-cell">
                    {formatDeparture(ride.departureTime)}
                  </td>
                  <td className="px-3 py-2.5 text-amber-200">
                    {ride.metrics
                      ? formatDistance(ride.metrics.distanceKm)
                      : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-orange-200">
                    {ride.metrics
                      ? formatCalories(ride.metrics.calories)
                      : '—'}
                  </td>
                  <td className="hidden px-3 py-2.5 text-zinc-400 md:table-cell">
                    {ride.metrics ? `~${ride.metrics.estimatedMinutes} min` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RidesTabNav({
  tab,
  onTabChange,
  upcomingCount,
  pastCount,
}: {
  tab: Tab;
  onTabChange: (t: Tab) => void;
  upcomingCount: number;
  pastCount: number;
}) {
  const base =
    'flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-3 text-center transition-all sm:flex-row sm:gap-2 sm:px-4';

  return (
    <nav
      className="app-card-strong grid grid-cols-3 gap-2 rounded-2xl p-2"
      aria-label="Navigation des balades"
    >
      <button
        type="button"
        onClick={() => onTabChange('upcoming')}
        className={`${base} ${
          tab === 'upcoming'
            ? 'bg-sky-500 text-white shadow-md shadow-sky-900/40'
            : 'text-sky-100 hover:bg-sky-950/40 hover:text-white'
        }`}
      >
        <span className="text-base sm:text-sm">🗓️</span>
        <span className="text-xs font-semibold sm:text-sm">À venir</span>
        <span
          className={`text-[10px] ${tab === 'upcoming' ? 'text-sky-100' : 'text-sky-200'}`}
        >
          {upcomingCount}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('past')}
        className={`${base} ${
          tab === 'past'
            ? 'bg-blue-800 text-sky-50 shadow-md'
            : 'text-sky-100 hover:bg-sky-950/40 hover:text-white'
        }`}
      >
        <span className="text-base sm:text-sm">📜</span>
        <span className="text-xs font-semibold sm:text-sm">Passées</span>
        <span
          className={`text-[10px] ${tab === 'past' ? 'text-zinc-300' : 'text-zinc-500'}`}
        >
          {pastCount}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('stats')}
        className={`${base} relative ${
          tab === 'stats'
            ? 'scale-[1.02] bg-gradient-to-br from-cyan-400 to-sky-600 text-white shadow-lg shadow-cyan-900/50 ring-2 ring-sky-200/50'
            : 'border border-dashed border-sky-300/40 bg-sky-950/50 text-sky-100 hover:border-cyan-300/60 hover:bg-sky-900/60'
        }`}
      >
        <span className="text-xl sm:text-lg">📊</span>
        <span className="text-sm font-bold sm:text-base">Stats</span>
        <span
          className={`text-[10px] font-medium ${tab === 'stats' ? 'text-sky-100' : 'text-cyan-200'}`}
        >
          km · kcal
        </span>
      </button>
    </nav>
  );
}

export default function RidesPage() {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [rides, setRides] = useState<RideGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('upcoming');

  async function loadRides() {
    try {
      setLoading(true);
      const res = await fetch('/api/ride-groups', { cache: 'no-store' });
      if (!res.ok) throw new Error('Impossible de charger les balades.');
      const data = await res.json();
      setRides(data);
      setError(null);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRides();
  }, []);

  async function handleJoin(rideId: number) {
    if (!user) {
      setError('Connecte-toi pour rejoindre une balade.');
      return;
    }

    try {
      setJoiningId(rideId);
      setError(null);
      const res = await fetch(`/api/ride-groups/${rideId}/join`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Erreur lors de la participation.');
      }
      await loadRides();
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'Erreur inconnue.');
    } finally {
      setJoiningId(null);
    }
  }

  const upcomingRides = useMemo(
    () =>
      rides
        .filter((r) => !isPast(r))
        .sort(
          (a, b) =>
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime(),
        ),
    [rides],
  );

  const pastRides = useMemo(
    () =>
      rides
        .filter((r) => isPast(r))
        .sort(
          (a, b) =>
            new Date(b.departureTime).getTime() -
            new Date(a.departureTime).getTime(),
        ),
    [rides],
  );

  const joinedRides = useMemo(
    () =>
      rides
        .filter((r) => isJoined(r, currentUserId) && !isPast(r))
        .sort(
          (a, b) =>
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime(),
        ),
    [rides, currentUserId],
  );

  const displayedRides =
    tab === 'upcoming' ? upcomingRides : tab === 'past' ? pastRides : [];
  const groupedUpcoming = useMemo(
    () => groupBySection(upcomingRides),
    [upcomingRides],
  );

  const myRides = useMemo(
    () => rides.filter((r) => isMyRide(r, currentUserId)),
    [rides, currentUserId],
  );

  const myTotals = useMemo(() => sumMetrics(myRides), [myRides]);

  return (
    <div className="app-shell min-h-screen">
      <header className="app-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Balades Velib</h1>
            <p className="text-xs text-zinc-500">
              Découvre et rejoins des balades à Paris
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AppNavLink
              href="/"
              className="rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 hover:from-cyan-400 hover:to-sky-500 transition-colors"
            >
              + Créer une balade
            </AppNavLink>
            <AppNavLink
              href="/"
              className="hidden rounded-full border border-sky-300/35 bg-sky-950/50 px-4 py-1.5 text-sm font-medium text-sky-100 backdrop-blur-sm transition-colors hover:bg-sky-900/60 sm:inline-block"
            >
              Carte
            </AppNavLink>
            <AuthNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Distance totale',
              value: loading
                ? '—'
                : formatDistance(Math.round(myTotals.totalKm * 10) / 10),
              sub: 'mes balades (estimée)',
              accent: 'text-cyan-200',
            },
            {
              label: 'Calories',
              value: loading ? '—' : formatCalories(myTotals.totalCalories),
              sub: '~30 kcal / km',
              accent: 'text-sky-200',
            },
            {
              label: 'À venir',
              value: loading ? '—' : String(upcomingRides.length),
              sub: 'balades programmées',
              accent: 'text-cyan-300',
            },
            {
              label: 'Mes balades',
              value: loading ? '—' : String(myRides.length),
              sub: `${joinedRides.length} inscription(s) active(s)`,
              accent: 'text-blue-200',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="app-card rounded-xl px-4 py-3"
            >
              <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                {stat.label}
              </div>
              <div className={`mt-1 text-2xl font-semibold ${stat.accent}`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-zinc-500">{stat.sub}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Liste principale */}
          <section className="min-w-0 flex-1">
            <div className="mb-6 space-y-4">
              <RidesTabNav
                tab={tab}
                onTabChange={setTab}
                upcomingCount={upcomingRides.length}
                pastCount={pastRides.length}
              />
              {tab !== 'stats' && (
                <div>
                  <h2 className="text-lg font-semibold">
                    {tab === 'upcoming' ? 'Balades à venir' : 'Historique'}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {tab === 'upcoming'
                      ? 'Rejoins une balade ou crée la tienne sur la carte.'
                      : 'Balades dont la date de départ est passée.'}
                  </p>
                </div>
              )}
            </div>
            {tab === 'stats' && (
              <StatsTabPanel
                myRides={myRides}
                myTotals={myTotals}
                loading={loading}
              />
            )}

            {tab !== 'stats' && loading && (
              <div className="space-y-3">
                <RideCardSkeleton />
                <RideCardSkeleton />
                <RideCardSkeleton />
              </div>
            )}

            {tab !== 'stats' && !loading && displayedRides.length === 0 && (
              <div className="rounded-xl app-card-muted border border-dashed border-white/20 px-6 py-12 text-center">
                <p className="text-sm font-medium text-zinc-300">
                  {tab === 'upcoming'
                    ? 'Aucune balade à venir pour le moment'
                    : 'Aucune balade passée'}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {tab === 'upcoming'
                    ? 'Sois le premier à organiser une sortie Velib !'
                    : 'Les balades terminées apparaîtront ici.'}
                </p>
                {tab === 'upcoming' && (
                  <AppNavLink
                    href="/"
                    className="mt-4 inline-block rounded-md bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-90 transition-opacity"
                  >
                    Créer une balade sur la carte
                  </AppNavLink>
                )}
              </div>
            )}

            {tab !== 'stats' && !loading && tab === 'upcoming' && groupedUpcoming.length > 0 && (
              <div className="space-y-6">
                {groupedUpcoming.map(({ label, rides: sectionRides }) => (
                  <div key={label}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {label}
                    </h3>
                    <div className="space-y-3">
                      {sectionRides.map((ride) => (
                        <RideCard
                          key={ride.id}
                          ride={ride}
                          joiningId={joiningId}
                          onJoin={handleJoin}
                          currentUserId={currentUserId}
                          isLoggedIn={!!user}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab !== 'stats' && !loading && tab === 'past' && pastRides.length > 0 && (
              <div className="space-y-3">
                {pastRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    joiningId={joiningId}
                    onJoin={handleJoin}
                    currentUserId={currentUserId}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>
            )}
          </section>

          {tab !== 'stats' && (
          <aside className="w-full shrink-0 lg:w-[340px]">
            <div className="app-card sticky top-4 rounded-xl p-4">
              <h2 className="text-lg font-semibold">Mes prochaines balades</h2>
              <p className="mt-1 text-xs text-zinc-400">
                {user
                  ? `Connecté · ${user.username}`
                  : 'Connecte-toi pour voir tes inscriptions'}
              </p>

              <div className="mt-4 space-y-3">
                {loading && (
                  <>
                    <RideCardSkeleton />
                    <RideCardSkeleton />
                  </>
                )}

                {!loading && joinedRides.length === 0 && (
                  <div className="rounded-lg app-card-muted border border-dashed border-white/20 px-3 py-6 text-center">
                    <p className="text-xs text-zinc-400">
                      Tu n&apos;es inscrit à aucune balade à venir.
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      Clique sur « Rejoindre » ou crée ta propre balade.
                    </p>
                  </div>
                )}

                {!loading &&
                  joinedRides.map((ride) => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      joiningId={joiningId}
                      onJoin={handleJoin}
                      currentUserId={currentUserId}
                      isLoggedIn={!!user}
                      compact
                    />
                  ))}
              </div>

              {!loading && joinedRides.length > 0 && (
                <p className="mt-4 text-center text-[10px] text-zinc-500">
                  {joinedRides.length} inscription
                  {joinedRides.length !== 1 ? 's' : ''} active
                  {joinedRides.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </aside>
          )}
        </div>
      </main>
    </div>
  );
}


'use client';

import { useMemo } from 'react';
import { formatCalories, formatDistance } from '@/lib/rideMetrics';

export type RideChartItem = {
  id: number;
  title: string;
  departureTime: string;
  distanceKm: number;
  calories: number;
  estimatedMinutes: number;
};

type RideWithMetrics = {
  id: number;
  title: string;
  departureTime: string;
  metrics: {
    distanceKm: number;
    calories: number;
    estimatedMinutes: number;
  } | null;
};

type StatsChartsProps = {
  rides: RideWithMetrics[];
  totalKm: number;
  totalCalories: number;
};

const CHART_COLORS = [
  '#34d399',
  '#fbbf24',
  '#fb923c',
  '#38bdf8',
  '#38bdf8',
  '#f472b6',
  '#4ade80',
  '#fcd34d',
];

function truncate(s: string, max: number) {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function DistanceBars({ rides }: { rides: RideChartItem[] }) {
  const sorted = [...rides].sort((a, b) => b.distanceKm - a.distanceKm).slice(0, 8);
  const maxKm = Math.max(...sorted.map((r) => r.distanceKm), 0.1);

  return (
    <div className="app-card rounded-xl p-4">
      <h4 className="text-xs font-semibold text-zinc-200">
        Top distances par balade
      </h4>
      <p className="mt-0.5 text-[10px] text-zinc-500">
        Plus la barre est longue, plus le trajet est estimé long
      </p>
      <ul className="mt-4 space-y-3">
        {sorted.map((ride, i) => {
          const pct = (ride.distanceKm / maxKm) * 100;
          const color = CHART_COLORS[i % CHART_COLORS.length];
          return (
            <li key={ride.id}>
              <div className="mb-1 flex justify-between gap-2 text-[10px]">
                <span className="truncate text-zinc-300" title={ride.title}>
                  {truncate(ride.title, 28)}
                </span>
                <span className="shrink-0 font-medium text-amber-200">
                  {formatDistance(ride.distanceKm)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    boxShadow: `0 0 12px ${color}55`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CaloriesDonut({
  rides,
  totalCalories,
}: {
  rides: RideChartItem[];
  totalCalories: number;
}) {
  const segments = useMemo(() => {
    const top = [...rides].sort((a, b) => b.calories - a.calories).slice(0, 6);
    const topSum = top.reduce((s, r) => s + r.calories, 0);
    const rest = Math.max(0, totalCalories - topSum);
    const items = top.map((r, i) => ({
      label: truncate(r.title, 18),
      value: r.calories,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
    if (rest > 0) {
      items.push({ label: 'Autres', value: rest, color: '#52525b' });
    }
    return items;
  }, [rides, totalCalories]);

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 72;
  const stroke = 28;

  const arcs = useMemo(() => {
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const arcAngles = segments.reduce<{ seg: (typeof segments)[0]; start: number; end: number; pct: number }[]>(
      (acc, seg) => {
        const pct = totalCalories > 0 ? seg.value / totalCalories : 0;
        const start = acc.length > 0 ? acc[acc.length - 1].end : -90;
        const end = start + pct * 360;
        acc.push({ seg, start, end, pct });
        return acc;
      },
      [],
    );
    return arcAngles.map(({ seg, start, end, pct }) => {
      const sweep = pct * 360;
      const large = sweep > 180 ? 1 : 0;
      const x1 = cx + r * Math.cos(rad(start));
      const y1 = cy + r * Math.sin(rad(start));
      const x2 = cx + r * Math.cos(rad(end));
      const y2 = cy + r * Math.sin(rad(end));
      if (pct < 0.001) return null;
      const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
      return (
        <path
          key={seg.label}
          d={d}
          fill="none"
          stroke={seg.color}
          strokeWidth={stroke}
          strokeLinecap="round"
        >
          <title>
            {seg.label}: {formatCalories(seg.value)} ({Math.round(pct * 100)}%)
          </title>
        </path>
      );
    });
  }, [segments, totalCalories, cx, cy, r, stroke]);

  return (
    <div className="app-card rounded-xl p-4">
      <h4 className="text-xs font-semibold text-zinc-200">
        Répartition des calories
      </h4>
      <p className="mt-0.5 text-[10px] text-zinc-500">
        Part estimée de l&apos;effort par balade
      </p>
      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
        <svg width={size} height={size} className="shrink-0">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#27272a"
            strokeWidth={stroke}
          />
          {arcs}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill="#fafafa"
            style={{ fontSize: 18, fontWeight: 700 }}
          >
            {totalCalories}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fill="#71717a"
            style={{ fontSize: 10 }}
          >
            kcal total
          </text>
        </svg>
        <ul className="flex flex-wrap justify-center gap-2 sm:max-w-[180px] sm:flex-col">
          {segments.map((seg) => (
            <li
              key={seg.label}
              className="flex items-center gap-2 text-[10px] text-zinc-400"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate">{seg.label}</span>
              <span className="ml-auto text-orange-200">
                {totalCalories > 0
                  ? `${Math.round((seg.value / totalCalories) * 100)}%`
                  : '—'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CumulativeKmLine({ rides }: { rides: RideChartItem[] }) {
  const points = useMemo(() => {
    const ordered = [...rides].sort(
      (a, b) =>
        new Date(a.departureTime).getTime() -
        new Date(b.departureTime).getTime(),
    );
    return ordered.reduce<
      { label: string; cum: number; km: number }[]
    >((acc, r) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].cum : 0;
      const cum = Math.round((prev + r.distanceKm) * 10) / 10;
      acc.push({
        label: new Date(r.departureTime).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        }),
        cum,
        km: r.distanceKm,
      });
      return acc;
    }, []);
  }, [rides]);

  if (points.length < 2) {
    return (
      <div className="app-card rounded-xl p-4">
        <h4 className="text-xs font-semibold text-zinc-200">
          Progression des km
        </h4>
        <p className="mt-4 text-center text-[10px] text-zinc-500">
          Au moins 2 balades pour afficher la courbe cumulative
        </p>
      </div>
    );
  }

  const w = 320;
  const h = 140;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const maxY = Math.max(...points.map((p) => p.cum), 1);
  const stepX = (w - pad.l - pad.r) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = pad.l + i * stepX;
    const y = pad.t + (h - pad.t - pad.b) * (1 - p.cum / maxY);
    return { x, y, ...p };
  });

  const lineD = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
    .join(' ');
  const areaD = `${lineD} L ${coords[coords.length - 1].x} ${h - pad.b} L ${coords[0].x} ${h - pad.b} Z`;

  return (
    <div className="app-card rounded-xl p-4">
      <h4 className="text-xs font-semibold text-zinc-200">
        Progression cumulative
      </h4>
      <p className="mt-0.5 text-[10px] text-zinc-500">
        Kilomètres estimés cumulés au fil de tes balades
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-3 w-full max-w-md"
        role="img"
        aria-label="Graphique km cumulés"
      >
        <defs>
          <linearGradient id="kmGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => {
          const y = pad.t + (h - pad.t - pad.b) * (1 - t);
          return (
            <line
              key={t}
              x1={pad.l}
              y1={y}
              x2={w - pad.r}
              y2={y}
              stroke="#3f3f46"
              strokeDasharray="4 4"
            />
          );
        })}
        <path d={areaD} fill="url(#kmGrad)" />
        <path d={lineD} fill="none" stroke="#34d399" strokeWidth="2.5" />
        {coords.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r="4"
              fill="#10b981"
              stroke="#064e3b"
              strokeWidth="1.5"
            >
              <title>
                {c.label}: +{c.km} km (total {c.cum} km)
              </title>
            </circle>
            <text
              x={c.x}
              y={h - 8}
              textAnchor="middle"
              fill="#71717a"
              style={{ fontSize: 8 }}
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function EffortGauge({
  totalKm,
  totalCalories,
  rideCount,
}: {
  totalKm: number;
  totalCalories: number;
  rideCount: number;
}) {
  const goalKm = 50;
  const pct = Math.min(100, Math.round((totalKm / goalKm) * 100));
  const croissants = Math.round(totalCalories / 300);
  const toursPiste = Math.round((totalKm / 0.4) * 10) / 10;
  const r = 56;
  const circ = Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div className="rounded-xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-cyan-500/5 p-4">
      <h4 className="text-xs font-semibold text-sky-100">
        Objectif explorateur Paris
      </h4>
      <p className="mt-0.5 text-[10px] text-zinc-500">
        Défi fictif : {goalKm} km à vélo (cumul de tes balades)
      </p>
      <div className="mt-4 flex flex-col items-center sm:flex-row sm:gap-6">
        <svg width={140} height={80} viewBox="0 0 140 80">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <path
            d={`M 14 70 A ${r} ${r} 0 0 1 126 70`}
            fill="none"
            stroke="#3f3f46"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={`M 14 70 A ${r} ${r} 0 0 1 126 70`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          <text
            x="70"
            y="58"
            textAnchor="middle"
            fill="#fafafa"
            style={{ fontSize: 22, fontWeight: 700 }}
          >
            {pct}%
          </text>
          <text x="70" y="74" textAnchor="middle" fill="#a1a1aa" style={{ fontSize: 9 }}>
            {formatDistance(totalKm)} / {goalKm} km
          </text>
        </svg>
        <ul className="space-y-2 text-[11px] text-zinc-400">
          <li>
            🥐 ~<span className="font-semibold text-orange-200">{croissants}</span>{' '}
            croissant{croissants !== 1 ? 's' : ''} (≈300 kcal)
          </li>
          <li>
            🏟️ ~<span className="font-semibold text-emerald-200">{toursPiste}</span>{' '}
            tours de piste (400 m)
          </li>
          <li>
            🚲 <span className="font-semibold text-sky-200">{rideCount}</span>{' '}
            balade{rideCount !== 1 ? 's' : ''} comptabilisée
            {rideCount !== 1 ? 's' : ''}
          </li>
        </ul>
      </div>
    </div>
  );
}

function WeekdayHeatmap({ rides }: { rides: RideChartItem[] }) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0, 0, 0];
    for (const r of rides) {
      const d = new Date(r.departureTime).getDay();
      const idx = d === 0 ? 6 : d - 1;
      c[idx] += 1;
    }
    return c;
  }, [rides]);
  const max = Math.max(...counts, 1);

  return (
    <div className="app-card rounded-xl p-4">
      <h4 className="text-xs font-semibold text-zinc-200">
        Habitudes — jours de départ
      </h4>
      <p className="mt-0.5 text-[10px] text-zinc-500">
        Quand tu planifies le plus de balades
      </p>
      <div className="mt-4 flex justify-between gap-1">
        {days.map((label, i) => {
          const intensity = counts[i] / max;
          return (
            <div
              key={label}
              className="flex flex-1 flex-col items-center gap-1"
              title={`${counts[i]} balade(s)`}
            >
              <div
                className="w-full rounded-md transition-all"
                style={{
                  height: 24 + intensity * 48,
                  background: `rgba(52, 211, 153, ${0.15 + intensity * 0.75})`,
                  boxShadow:
                    intensity > 0.5
                      ? `0 0 16px rgba(52, 211, 153, ${intensity * 0.4})`
                      : undefined,
                }}
              />
              <span className="text-[9px] text-zinc-500">{label}</span>
              <span className="text-[10px] font-medium text-emerald-300/80">
                {counts[i] || '·'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StatsCharts({
  rides,
  totalKm,
  totalCalories,
}: StatsChartsProps) {
  const chartRides: RideChartItem[] = useMemo(
    () =>
      rides
        .filter((r) => r.metrics)
        .map((r) => ({
          id: r.id,
          title: r.title,
          departureTime: r.departureTime,
          distanceKm: r.metrics!.distanceKm,
          calories: r.metrics!.calories,
          estimatedMinutes: r.metrics!.estimatedMinutes,
        })),
    [rides],
  );

  if (chartRides.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Graphiques
      </h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <DistanceBars rides={chartRides} />
        <CaloriesDonut rides={chartRides} totalCalories={totalCalories} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <CumulativeKmLine rides={chartRides} />
        <WeekdayHeatmap rides={chartRides} />
      </div>
      <EffortGauge
        totalKm={totalKm}
        totalCalories={totalCalories}
        rideCount={chartRides.length}
      />
    </div>
  );
}

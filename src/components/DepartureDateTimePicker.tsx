'use client';

import { useMemo } from 'react';

type DepartureDateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function splitDateTime(value: string) {
  if (!value) return { date: '', time: '' };
  const [date, timePart] = value.split('T');
  return { date: date ?? '', time: timePart?.slice(0, 5) ?? '' };
}

function combineDateTime(date: string, time: string) {
  if (!date || !time) return '';
  return `${date}T${time}`;
}

const inputClassName =
  'app-input w-full rounded-md px-3 py-2 text-xs outline-none ring-0 [color-scheme:dark]';

export default function DepartureDateTimePicker({
  value,
  onChange,
}: DepartureDateTimePickerProps) {
  const { date, time } = splitDateTime(value);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const preview = useMemo(() => {
    if (!date || !time) return null;
    const parsed = new Date(combineDateTime(date, time));
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [date, time]);

  function handleDateChange(nextDate: string) {
    onChange(combineDateTime(nextDate, time || '12:00'));
  }

  function handleTimeChange(nextTime: string) {
    onChange(combineDateTime(date || minDate, nextTime));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-[10px] font-medium text-zinc-400">
            Date
          </label>
          <input
            type="date"
            lang="fr-FR"
            min={minDate}
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-medium text-zinc-400">
            Heure
          </label>
          <input
            type="time"
            lang="fr-FR"
            step={300}
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>
      <p className="text-[10px] text-zinc-500">
        Clique sur la date pour ouvrir le calendrier, sur l&apos;heure pour
        choisir l&apos;horaire.
      </p>
      {preview && (
        <p className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1.5 text-[10px] text-sky-200">
          Départ prévu : <span className="font-medium">{preview}</span>
        </p>
      )}
    </div>
  );
}

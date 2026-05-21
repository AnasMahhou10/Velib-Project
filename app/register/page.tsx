'use client';

import { FormEvent, useState } from 'react';
import AppNavLink from '@/components/AppNavLink';
import { useAuth } from '@/components/AuthProvider';

export default function RegisterPage() {
  const { refresh } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Inscription impossible.');
      }

      await refresh();
      // Rechargement complet pour appliquer le cookie JWT tout de suite
      window.location.href = '/';
      return;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4">
      <div className="app-card w-full max-w-md rounded-xl p-6">
        <h1 className="text-xl font-semibold text-zinc-50">Inscription</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Crée un compte pour organiser et rejoindre des balades.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-zinc-400" htmlFor="username">
              Pseudo
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              minLength={2}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border border-sky-300/30 bg-sky-950/60 px-3 py-2 text-sm text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-sky-300/30 bg-sky-950/60 px-3 py-2 text-sm text-zinc-50"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-sky-300/30 bg-sky-950/60 px-3 py-2 text-sm text-zinc-50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-300">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gradient-to-r from-cyan-500 to-sky-600 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Déjà inscrit ?{' '}
          <AppNavLink href="/login" className="text-cyan-300 hover:underline">
            Se connecter
          </AppNavLink>
        </p>
      </div>
    </div>
  );
}

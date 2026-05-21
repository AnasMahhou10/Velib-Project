'use client';

import { FormEvent, useState } from 'react';
import AppNavLink from '@/components/AppNavLink';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Connexion impossible.');
      }

      await refresh();
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
        <h1 className="text-xl font-semibold text-zinc-50">Connexion</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Accède à tes balades et inscriptions.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              autoComplete="current-password"
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
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Pas de compte ?{' '}
          <AppNavLink href="/register" className="text-cyan-300 hover:underline">
            Créer un compte
          </AppNavLink>
        </p>
        <p className="mt-2 text-center">
          <AppNavLink href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← Retour à la carte
          </AppNavLink>
        </p>
      </div>
    </div>
  );
}

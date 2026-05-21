'use client';

import AppNavLink from '@/components/AppNavLink';
import { useAuth } from '@/components/AuthProvider';

export default function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <span className="text-xs text-zinc-500">Chargement…</span>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <AppNavLink
          href="/login"
          className="rounded-full border border-sky-300/35 bg-sky-950/50 px-3 py-1.5 text-xs font-medium text-sky-100 hover:bg-sky-900/60"
        >
          Connexion
        </AppNavLink>
        <AppNavLink
          href="/register"
          className="rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:opacity-90"
        >
          Inscription
        </AppNavLink>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-sky-200/90 sm:inline">
        {user.username}
      </span>
      <button
        type="button"
        onClick={() => logout()}
        className="rounded-full border border-sky-300/35 bg-sky-950/50 px-3 py-1.5 text-xs font-medium text-sky-100 hover:bg-sky-900/60"
      >
        Déconnexion
      </button>
    </div>
  );
}

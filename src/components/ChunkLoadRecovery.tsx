'use client';

import { useEffect } from 'react';

const RELOAD_FLAG = 'velib-chunk-reload';

function isChunkLoadError(message: string) {
  return (
    message.includes('ChunkLoadError') ||
    message.includes('Loading chunk') ||
    message.includes('Failed to load chunk')
  );
}

/**
 * En dev, Turbopack peut invalider des chunks après un hot-reload.
 * Si la navigation charge un ancien hash, on recharge une fois la page.
 */
export default function ChunkLoadRecovery() {
  useEffect(() => {
    function tryRecover(reason: unknown) {
      const message =
        typeof reason === 'string'
          ? reason
          : reason instanceof Error
            ? reason.message
            : String(reason ?? '');

      if (!isChunkLoadError(message)) return;
      if (sessionStorage.getItem(RELOAD_FLAG)) return;

      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
    }

    const onError = (event: ErrorEvent) => {
      tryRecover(event.message);
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      tryRecover(event.reason);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      sessionStorage.removeItem(RELOAD_FLAG);
    }, 30_000);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}

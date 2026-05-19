'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

type AppNavLinkProps = ComponentProps<typeof Link>;

/** Navigation interne sans prefetch (évite des chunks obsolètes en dev). */
export default function AppNavLink({
  prefetch = false,
  ...props
}: AppNavLinkProps) {
  return <Link prefetch={prefetch} {...props} />;
}


"use client";

import { Suspense } from 'react';
import { StylistClient } from './stylist-client';

export default function StylistPage() {
  return (
    // The search params are read by the client component,
    // so we wrap it in a Suspense boundary as recommended by Next.js.
    <Suspense>
      <StylistClient />
    </Suspense>
  );
}

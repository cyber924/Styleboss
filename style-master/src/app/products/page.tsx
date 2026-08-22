
import ProductsPageClient from './products-client';
import { Suspense } from 'react';

export default function ProductsPage() {
    return (
      // The search params are read by the client component,
      // so we wrap it in a Suspense boundary as recommended by Next.js.
      <Suspense>
        <ProductsPageClient />
      </Suspense>
    );
}

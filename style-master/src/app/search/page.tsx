
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { productSearch, ProductSearchOutput } from '@/ai/flows/product-search';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/types';
import { Frown } from 'lucide-react';

function SearchResults({ query }: { query: string | null }) {
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      const performSearch = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await productSearch({ query });
          // Replace imageUrl with a seeded Picsum URL
          const formattedResults = response.results.map((r, index) => ({
              ...r,
              id: r.productId,
              category: 'all' as const,
              // Use a consistent seed for each image based on product ID or index
              imageUrl: `https://picsum.photos/seed/${r.productId.slice(0, 5) || index}/400/533`, 
              dataAiHint: r.name.split(' ').slice(0, 2).join(' '),
          }));
          setResults(formattedResults);
        } catch (e) {
          console.error("Search failed:", e);
          setError("검색에 실패했습니다. 다시 시도해주세요.");
        } finally {
          setLoading(false);
        }
      };
      performSearch();
    } else {
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return <SearchResultsSkeleton />;
  }

  if (error) {
    return <div className="text-center py-20 text-destructive">{error}</div>;
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-20">
        <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg text-muted-foreground">
          `{query}`에 대한 검색 결과가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {results.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function SearchPageContent({ query }: { query: string | null }) {
    return (
        <p className="mt-2 text-lg text-muted-foreground">
            <span className="text-primary font-semibold">"{query}"</span>에 대한 AI 검색 결과입니다.
        </p>
    )
}

function SearchResultsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-[400px] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
      </div>
    )
}

function SearchPageClient() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    return (
        <div className="container py-12 md:py-20">
            <div className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
                    검색 결과
                </h1>
                <SearchPageContent query={query} />
            </div>
            <SearchResults query={query} />
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense>
            <SearchPageClient />
        </Suspense>
    )
}

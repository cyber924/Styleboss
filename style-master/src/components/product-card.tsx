import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  // '인기' 상품도 일반 상품과 동일한 상세 페이지를 사용하도록 경로를 수정합니다.
  const href = `/products/${product.id}`;

  return (
    <Link href={href} className="group block">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
        <div className="aspect-square overflow-hidden relative">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
            data-ai-hint={product.dataAiHint}
          />
        </div>
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-headline text-lg font-medium leading-tight truncate">{product.name}</h3>
            <p className="text-primary font-semibold text-xl">
              {product.price.toLocaleString()}원
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

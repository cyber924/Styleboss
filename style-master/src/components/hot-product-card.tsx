
import Link from 'next/link';
import Image from 'next/image';
import type { HotProduct } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame, ImageIcon } from 'lucide-react';

export function HotProductCard({ product }: { product: HotProduct }) {
  return (
    <Link href={`/hot/${product.id}`} className="group block">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-destructive">
        <div className="aspect-square overflow-hidden relative bg-muted">
          <div className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg">
            <Flame className="h-5 w-5" />
          </div>
          {product.mainImageUrl ? (
            <Image
                src={product.mainImageUrl}
                alt={product.name}
                fill
                className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                data-ai-hint={product.dataAiHint}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
           <div className="space-y-1">
            <h3 className="font-headline text-lg font-medium leading-tight truncate">{product.name}</h3>
            <p className="text-destructive font-semibold text-xl">
              {product.price.toLocaleString()}원
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

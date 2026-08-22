
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { AiProduct } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Frown, Bot } from 'lucide-react';
import { ProductCard } from '@/components/product-card';

function ProductSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[380px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export default function AiProductsPage() {
    const [products, setProducts] = useState<AiProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const productsCollection = collection(db, 'ai_products');
                const q = query(productsCollection, orderBy('createdAt', 'desc'));
                
                const snapshot = await getDocs(q);
                
                const productsList = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                })) as AiProduct[];

                setProducts(productsList);
            } catch (error) {
                console.error("Error fetching AI products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold font-headline tracking-tight flex items-center justify-center gap-3">
                    <Bot className="h-10 w-10 text-primary" />
                    AI 추천 상품
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">AI가 네이버, 쿠팡, 지그재그, 에이블리, 무신사의 인기 상품을 분석하여 추천합니다.</p>
            </div>
            
            <div className="mt-10">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                             <Link key={product.id} href={`/ai-products/${product.id}`} className="group block">
                                <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
                                    <div className="aspect-square overflow-hidden relative">
                                        <Image
                                            src={product.mainImageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
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
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg text-muted-foreground">추천 상품이 없습니다. 관리자 페이지에서 데이터를 등록해주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

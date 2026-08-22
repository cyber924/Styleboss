
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Frown } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/types';

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

export default function ProductsPageClient() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category') || 'all';
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const productsCollection = collection(db, 'products');
                let q;

                // Query by category if it's not 'all'. Otherwise, get all documents.
                if (category === 'all') {
                    q = query(productsCollection);
                } else {
                    q = query(productsCollection, where('category', '==', category));
                }
                
                const snapshot = await getDocs(q);
                
                let productsList = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                })) as Product[];

                // Sort by creation date for 'all' and 'latest' categories on the client side
                // to avoid needing a specific Firestore index.
                if (category === 'all' || category === 'latest') {
                    productsList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                }
                
                setProducts(productsList);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold font-headline tracking-tight">Shop Collection</h1>
                <p className="mt-2 text-lg text-muted-foreground">AI가 추천하는 당신을 위한 스타일을 찾아보세요.</p>
            </div>
            
            <Tabs value={category} className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px] mx-auto">
                    <TabsTrigger value="all" asChild><Link href="/products?category=all">전체</Link></TabsTrigger>
                    <TabsTrigger value="latest" asChild><Link href="/products?category=latest">최신</Link></TabsTrigger>
                    <TabsTrigger value="popular" asChild><Link href="/products?category=popular">인기</Link></TabsTrigger>
                </TabsList>
                <div className="mt-10">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                           <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                           <p className="mt-4 text-lg text-muted-foreground">이 카테고리에는 상품이 없습니다.</p>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

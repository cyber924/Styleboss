
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Sparkles } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
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

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const q = query(productsCollection, orderBy('createdAt', 'desc'), limit(4));
        const snapshot = await getDocs(q);
        
        const productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        setFeaturedProducts(productsList);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-80 z-10"></div>
        <Image 
          src="https://ifh.cc/g/vV8PQC.jpg"
          alt="Fashion model background"
          fill
          className="object-cover animate-shine"
          data-ai-hint="fashion model"
        />
        <div className="relative z-20 p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter leading-tight">
            AI가 찾아주는, <br />
            나만의 스타일.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
            StyleWise AI와 함께 당신의 완벽한 룩을 발견하세요.
            <br />
            최신 트렌드부터 숨겨진 보석까지, AI가 모두 찾아드립니다.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg transition-transform hover:scale-105">
              <Link href="/products">쇼핑 시작하기</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10 hover:text-white font-bold shadow-lg transition-transform hover:scale-105">
              <Link href="/stylist">AI 스타일리스트 <Sparkles className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-center md:text-left">
              금주의 추천 상품
            </h2>
             <Button asChild variant="ghost" className="mt-4 md:mt-0">
                <Link href="/products">전체 상품 보기 <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-primary/5 py-16 md:py-24">
         <div className="container grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">상상 속의 옷을 현실로</h2>
                <p className="mt-4 text-lg text-foreground/80 max-w-lg">
                    원하는 옷의 스타일, 색상, 패턴을 설명해주세요. StyleWise AI가 당신의 상상을 눈앞에 이미지로 만들어 드립니다. 세상에 단 하나뿐인, 당신만을 위한 옷을 디자인해보세요.
                </p>
                <Button asChild size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg transition-transform hover:scale-105">
                    <Link href="/stylist">AI 스타일리스트 사용하기 <Sparkles className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
            <div className="order-1 md:order-2 aspect-square rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-105">
                <Image 
                    src="https://ifh.cc/g/TY7zSP.jpg"
                    alt="AI generated clothing"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                    data-ai-hint="AI clothing"
                />
            </div>
         </div>
      </section>
    </div>
  );
}

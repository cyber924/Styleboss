
"use client";

import { useState, useEffect } from 'react';
import { HotProductCard } from '@/components/hot-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Frown, Flame, Sparkles } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import type { HotProduct, UserProfile } from '@/lib/types';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

export default function HotProductsPage() {
    const [products, setProducts] = useState<HotProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data() as UserProfile);
                    } else {
                        setUserProfile(null);
                    }
                });
                return () => unsubscribeProfile();
            } else {
                setUserProfile(null);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        setLoading(true);
        const productsCollection = collection(db, 'hot_products');
        const q = query(productsCollection, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                let productsList = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                })) as HotProduct[];

                if (userProfile && userProfile.preferredCategories && userProfile.preferredCategories.length > 0) {
                    productsList.sort((a, b) => {
                        const aIsPreferred = a.category && userProfile.preferredCategories!.includes(a.category);
                        const bIsPreferred = b.category && userProfile.preferredCategories!.includes(b.category);
                        if (aIsPreferred && !bIsPreferred) return -1;
                        if (!aIsPreferred && bIsPreferred) return 1;
                        return 0;
                    });
                }
                
                setProducts(productsList);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching hot products:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userProfile]);

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold font-headline tracking-tight flex items-center justify-center gap-3">
                    <Flame className="h-10 w-10 text-destructive" />
                    Hot Deals
                    <Flame className="h-10 w-10 text-destructive" />
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">지금 가장 인기있는 상품들을 만나보세요.</p>
            </div>
            
            {userProfile && userProfile.preferredCategories && userProfile.preferredCategories.length > 0 && (
                <Alert className="mb-12 max-w-2xl mx-auto bg-primary/5 border-primary/20">
                    <Sparkles className="h-4 w-4 !text-primary" />
                    <AlertTitle className="font-bold text-primary">'My Style' 맞춤 추천 적용 중</AlertTitle>
                    <AlertDescription>
                        당신이 선택한 '{userProfile.preferredCategories.join(', ')}' 상품을 먼저 보여드립니다.
                    </AlertDescription>
                </Alert>
            )}

            <div className="mt-10">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <HotProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg text-muted-foreground">진행 중인 핫딜 상품이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

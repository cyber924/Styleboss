import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

export function ProductDetailSkeleton() {
  return (
    <main>
        <div className="container py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
                <Skeleton className="aspect-[3/4] rounded-2xl" />
                <div className="flex flex-col h-full">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full mt-4" />
                    <Skeleton className="h-6 w-5/6 mt-2" />
                    <div className="mt-8">
                        <Skeleton className="h-12 w-1/3" />
                    </div>
                    <div className="mt-auto pt-8 space-y-4">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                </div>
            </div>
        </div>
        <section className="bg-muted/50 mt-12">
            <div className="container py-16 md:py-24">
                <div className="flex items-center gap-3 mb-8 text-center flex-col">
                    <Sparkles className="h-8 w-8 text-accent" />
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">StyleWise AI 추천</h2>
                    <p className="text-muted-foreground max-w-2xl">AI 추천 정보를 불러오는 중입니다...</p>
                </div>
                <div className="space-y-12">
                    <div>
                        <Skeleton className="h-7 w-1/3 mb-4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6 mt-2" />
                    </div>
                    <div>
                        <Skeleton className="h-8 w-1/2 mb-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col space-y-3">
                                    <Skeleton className="h-[320px] w-full rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
  );
}

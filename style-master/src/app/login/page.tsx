
import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

function LoginSkeleton() {
    return (
        <Card className="max-w-md w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">로그인</CardTitle>
                <CardDescription>계정에 로그인하여 쇼핑을 계속하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-5 w-2/3 mx-auto" />
            </CardContent>
        </Card>
    )
}

export default function LoginPage() {
  // The search params are read by the client component,
  // so we wrap it in a Suspense boundary as recommended by Next.js.
  return (
    <div className="container flex items-center justify-center py-20 min-h-[calc(100vh-8rem)]">
        <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
        </Suspense>
    </div>
  );
}

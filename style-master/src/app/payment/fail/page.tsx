
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaymentFailContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const message = searchParams.get('message');
    const orderId = searchParams.get('orderId');

    return (
        <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">결제에 실패했습니다.</h2>
            <p className="mt-2 text-muted-foreground">
                문제가 지속되면 고객센터로 문의해주세요.
            </p>

            <Card className="mt-8 w-full text-left bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg">실패 정보</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p><strong>오류 코드:</strong> {code || 'N/A'}</p>
                    <p><strong>오류 메시지:</strong> {message || '알 수 없는 오류'}</p>
                    <p><strong>주문 번호:</strong> {orderId || 'N/A'}</p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentFailPage() {
    return (
        <div className="container py-12 md:py-24">
            <Card className="max-w-2xl mx-auto">
                 <CardHeader className="text-center">
                    <CardTitle className="text-3xl">결제 결과</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense>
                        <PaymentFailContent />
                    </Suspense>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/my-products">장바구니로 돌아가기 <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

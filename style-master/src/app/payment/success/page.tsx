
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { confirmPayment } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle2, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const [paymentResult, setPaymentResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processPayment = async () => {
            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId');
            const amount = searchParams.get('amount');

            if (!paymentKey || !orderId || !amount) {
                setError('잘못된 결제 정보입니다.');
                setLoading(false);
                return;
            }

            try {
                const result = await confirmPayment({
                    paymentKey,
                    orderId,
                    amount: Number(amount),
                });
                setPaymentResult(result);
                // Clear cart after successful payment
                localStorage.removeItem('cart');
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        processPayment();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">결제를 안전하게 처리하고 있습니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <p className="text-lg font-bold">결제 처리 실패</p>
                <p className="text-sm text-destructive">{error}</p>
                 <Button asChild>
                    <Link href="/my-products">장바구니로 돌아가기 <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold">주문이 성공적으로 완료되었습니다!</h2>
            <p className="text-muted-foreground">감사합니다. 고객님의 주문 내역입니다.</p>
            {paymentResult && (
                <Card className="w-full max-w-md mt-6">
                    <CardHeader>
                        <CardTitle>결제 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableHead>주문 번호</TableHead>
                                    <TableCell className="text-right">{paymentResult.orderId}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead>결제 금액</TableHead>
                                    <TableCell className="text-right font-bold">{paymentResult.totalAmount.toLocaleString()}원</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead>결제 수단</TableHead>
                                    <TableCell className="text-right">{paymentResult.method} ({paymentResult.card?.company})</TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableHead>결제일시</TableHead>
                                    <TableCell className="text-right">{new Date(paymentResult.approvedAt).toLocaleString()}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full">
                            <Link href="/products">쇼핑 계속하기 <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}


export default function PaymentSuccessPage() {
    return (
        <div className="container py-12 md:py-24">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">결제 결과</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[300px] flex items-center justify-center">
                    <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}>
                        <PaymentSuccessContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}


"use client";

import { useState, useEffect, useTransition, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Frown, ShoppingCart, Trash2, Wand2, Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeStyleFromCart } from '@/ai/flows/style-analysis';
import type { StyleAnalysisOutput } from '@/ai/flows/style-analysis';
import { StyleAnalysisResult } from '@/components/style-analysis-result';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { nanoid } from 'nanoid';
import { Checkbox } from '@/components/ui/checkbox';

type CartItem = Product & { quantity: number };

export default function MyProductsPage() {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  const [isAnalyzing, startAnalyzingTransition] = useTransition();
  const [isPaying, startPayingTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<StyleAnalysisOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const items: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(items);
      // Initially, select all items in the cart.
      setSelectedIds(items.map(item => item.id));
    } catch (error) {
      console.error("장바구니 로딩 실패:", error);
      toast({
        title: "오류",
        description: "장바구니 정보를 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const selectedItems = useMemo(() => 
    cartItems.filter(item => selectedIds.includes(item.id)),
    [cartItems, selectedIds]
  );

  const totalAmount = useMemo(() =>
    selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems]
  );

  const handleSelectionChange = (productId: string) => {
    setSelectedIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(cartItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const removeItem = (productId: string) => {
    try {
      const newCartItems = cartItems.filter(item => item.id !== productId);
      setCartItems(newCartItems);
      setSelectedIds(prev => prev.filter(id => id !== productId));
      localStorage.setItem('cart', JSON.stringify(newCartItems));
      toast({
        title: "상품 삭제",
        description: "상품이 장바구니에서 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "상품 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };


  const handleStyleAnalysis = () => {
    if (selectedItems.length === 0) {
      toast({ title: '분석할 상품이 없습니다.', description: '먼저 장바구니에서 상품을 선택해주세요.', variant: 'destructive' });
      return;
    }

    startAnalyzingTransition(async () => {
      setAnalysisResult(null);
      setAnalysisError(null);
      try {
        const productNames = selectedItems.map(item => item.name);
        const result = await analyzeStyleFromCart({ productNames });
        setAnalysisResult(result);
        toast({
          title: "AI 스타일 분석 완료!",
          description: "나의 쇼핑 스타일을 확인해보세요.",
        });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
        setAnalysisError(errorMessage);
        toast({
          title: "AI 분석 실패",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  const handlePayment = async () => {
    if (!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) {
        toast({ title: "오류", description: "결제 설정이 올바르지 않습니다.", variant: "destructive"});
        return;
    }

    if (totalAmount === 0) {
        toast({ title: "오류", description: "결제할 상품을 선택해주세요.", variant: "destructive"});
        return;
    }

    startPayingTransition(async () => {
        const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
        const orderName = selectedItems.length > 1 
            ? `${selectedItems[0].name} 외 ${selectedItems.length - 1}건` 
            : selectedItems[0].name;

        try {
            await tossPayments.requestPayment('카드', {
              amount: totalAmount,
              orderId: `stylewise-${nanoid()}`,
              orderName: orderName,
              successUrl: `${window.location.origin}/payment/success`,
              failUrl: `${window.location.origin}/payment/fail`,
            });
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                 toast({ title: "결제 오류", description: error.message, variant: "destructive"});
            }
        }
    });
  };

  if (!isClient) {
    // Render a skeleton or loading state on the server
    return (
      <div className="container py-12">
        <CardHeader>
          <CardTitle>내 상품 (장바구니)</CardTitle>
          <CardDescription>장바구니에 담긴 상품 목록입니다.</CardDescription>
        </CardHeader>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart />
            내 상품 (장바구니)
          </CardTitle>
          <CardDescription>결제할 상품을 선택해주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-muted rounded-lg">
              <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">장바구니가 비어 있습니다.</p>
              <Button asChild className="mt-6">
                <Link href="/products">쇼핑 계속하기</Link>
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="모두 선택"
                      />
                    </TableHead>
                    <TableHead className="w-[100px]">이미지</TableHead>
                    <TableHead>상품명</TableHead>
                    <TableHead className="text-right">가격</TableHead>
                    <TableHead className="text-center">수량</TableHead>
                    <TableHead className="text-right">합계</TableHead>
                    <TableHead className="text-center w-[50px]">삭제</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id} data-state={selectedIds.includes(item.id) ? 'selected' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={() => handleSelectionChange(item.id)}
                          aria-label={`${item.name} 선택`}
                        />
                      </TableCell>
                      <TableCell>
                        <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-md object-cover" />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.price.toLocaleString()}원</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right font-semibold">{(item.price * item.quantity).toLocaleString()}원</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {cartItems.length > 0 && (
          <CardFooter className="flex flex-col items-end gap-4 bg-muted/50 p-6">
            <div className="text-xl font-bold">
              총 주문 금액: <span className="text-primary text-2xl ml-2">{totalAmount.toLocaleString()}원</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleStyleAnalysis} variant="outline" size="lg" disabled={isAnalyzing || isPaying || selectedItems.length === 0}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                내 스타일 분석
              </Button>
              <Button onClick={handlePayment} size="lg" className="font-bold" disabled={isPaying || isAnalyzing || totalAmount === 0}>
                {isPaying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                결제하기
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {isAnalyzing && (
        <div className="text-center text-muted-foreground flex flex-col items-center justify-center py-10">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">AI가 고객님의 쇼핑 스타일을 분석하고 있습니다...</p>
        </div>
      )}

      {analysisError && (
          <Alert variant="destructive" className="mt-6">
              <Wand2 className="h-4 w-4" />
              <AlertTitle>분석 오류</AlertTitle>
              <AlertDescription>{analysisError}</AlertDescription>
          </Alert>
      )}

      {analysisResult && (
        <div className="mt-8">
          <StyleAnalysisResult result={analysisResult} />
        </div>
      )}
    </div>
  );
}

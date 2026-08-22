
"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { HotProduct } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Loader2, Bot, Pencil, Sparkles, Trash2, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function HotProductManagePage() {
  const { toast } = useToast();
  const [isProcessing, startProcessingTransition] = useTransition();

  const [products, setProducts] = useState<HotProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<HotProduct | null>(null);

  useEffect(() => {
    const productsCollectionRef = collection(db, 'hot_products');
    const q = query(productsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HotProduct));
        setProducts(productsList);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching hot products:", err);
        setError("핫딜 상품 목록을 불러오는 데 실패했습니다.");
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);
  
  const handleAddSampleProduct = () => {
    startProcessingTransition(async () => {
        try {
            await addDoc(collection(db, "hot_products"), {
                name: "[샘플] 프렌치 시크 썸머 니트",
                price: 72000,
                mainImageUrl: "https://placehold.co/800x1067.png",
                dataAiHint: 'summer knit',
                thumbnailImageUrls: ['https://placehold.co/500x500.png'],
                shippingInfo: "무료배송 | 1~2일 내 출고",
                options: [{ name: '색상', values: ['아이보리', '베이지', '스카이블루'] }, { name: '사이즈', values: ['FREE']}],
                summaryBanner: {
                  imageUrl: 'https://placehold.co/800x400.png',
                  keyPoints: ['#프렌치시크', '#여름니트', '#꾸안꾸'],
                },
                detailImageUrls: [
                    'https://placehold.co/800x533.png',
                    'https://placehold.co/800x1067.png'
                ],
                specifications: [
                    { key: '소재', value: '린넨 55%, 코튼 45%' },
                    { key: '제조국', value: '대한민국' },
                ],
                usagePrecautions: '소재 특성상 드라이클리닝을 권장합니다.',
                reviews: [
                    { author: '김**', rating: 5, text: '핏도 예쁘고 시원해서 좋아요!', createdAt: '2024.08.01' }
                ],
                exchangeReturnInfo: '상품 수령 후 7일 이내에 교환/반품이 가능합니다.',
                createdAt: serverTimestamp()
            });
            toast({ title: '성공!', description: '샘플 핫딜 상품이 등록되었습니다.' });
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
            setError(`샘플 등록 실패: ${message}`);
        }
    });
  };

  const handleDeleteClick = (product: HotProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!productToDelete) return;

    startProcessingTransition(async () => {
      try {
        await deleteDoc(doc(db, 'hot_products', productToDelete.id));
        toast({
          title: "삭제 완료",
          description: `상품 '${productToDelete.name}'이(가) 성공적으로 삭제되었습니다.`,
        });
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (err) {
        toast({
          title: "삭제 실패",
          description: `상품 삭제 중 오류가 발생했습니다: ${err instanceof Error ? err.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Flame className="text-destructive"/>[핫딜] 상품 관리</CardTitle>
          <CardDescription>
            특별 할인가로 제공되는 핫딜 상품 데이터를 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={handleAddSampleProduct} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              샘플 핫딜 상품 추가
            </Button>
          </div>

            {error && (
              <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                <p className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /><strong>오류 발생:</strong> {error}</p>
              </div>
            )}

          <h3 className="text-lg font-semibold mb-4">핫딜 상품 목록</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">이미지</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead className="text-right">가격</TableHead>
                  <TableHead className="w-[120px] text-center">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}><Skeleton className="h-16 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      등록된 핫딜 상품이 없습니다. 샘플을 추가해보세요.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                       <Image
                        src={product.mainImageUrl}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">
                      {product.price.toLocaleString()}원
                    </TableCell>
                     <TableCell className="text-center space-x-1">
                        <Button asChild variant="outline" size="icon" title="상품 수정">
                            <Link href={`/admin/hot-product-manage/${product.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(product)}
                          disabled={isProcessing}
                          title="상품 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 핫딜 상품 '{productToDelete?.name}'이(가) 서버에서 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isProcessing} className="bg-destructive hover:bg-destructive/90">
               {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

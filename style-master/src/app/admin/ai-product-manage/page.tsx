
"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import Papa from "papaparse";
import { db, storage } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, getDocs, writeBatch, doc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { AiProduct } from "@/lib/types";
import { sampleAiProductsCsv } from "@/lib/seed-ai-products-csv-sample";
import { enrichProduct } from "@/ai/flows/ai-product-enrichment";
import { generateAndUploadProductImage } from "@/ai/flows/ai-product-image-generation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Loader2, UploadCloud, Bot, Pencil, Download, Sparkles, ImagePlus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
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

export default function AiProductManagePage() {
  const { toast } = useToast();
  const [isProcessing, startProcessingTransition] = useTransition();
  const [isEnriching, startEnrichingTransition] = useTransition();
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
  const [isDeleting, startDeletingTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<AiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AiProduct | null>(null);


  const isAllSelected = products.length > 0 && selectedProductIds.length === products.length;

  useEffect(() => {
    const productsCollectionRef = collection(db, 'ai_products');
    const q = query(productsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AiProduct));
        setProducts(productsList);
        setIsLoading(false);
      }, 
      (err) => {
        console.error("Error fetching AI products:", err);
        setError("AI 상품 목록을 불러오는 데 실패했습니다.");
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleBulkUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        parseAndUploadCsv(file);
      }
    };
    fileInput.click();
  };
  
  const parseAndUploadCsv = (file: File) => {
    startProcessingTransition(async () => {
        setError(null);
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            const data = results.data as any[];
            if (results.errors.length > 0) {
              setError(`CSV 파싱 오류: ${results.errors.map(e => e.message).join(', ')}`);
              return;
            }
            try {
              const batch = writeBatch(db);
              const collectionRef = collection(db, "ai_products");
              data.forEach(row => {
                const docRef = doc(collectionRef);
                const productData = {
                  source: row.source,
                  name: row.name,
                  price: Number(row.price),
                  shippingInfo: row.shippingInfo,
                  mainImageUrl: row.mainImageUrl,
                  thumbnailImageUrls: row.thumbnailImageUrls?.split('|') || [],
                  options: row.options?.split(';').map((opt: string) => {
                    const [name, values] = opt.split(':');
                    return { name, values: values?.split(',') || [] };
                  }) || [],
                  summaryBanner: {
                    imageUrl: row.summaryBannerImageUrl,
                    keyPoints: row.summaryBannerKeyPoints?.split('|') || [],
                  },
                  detailImageUrls: row.detailImageUrls?.split('|') || [],
                  specifications: row.specifications?.split(';').map((spec: string) => {
                    const [key, value] = spec.split(':');
                    return { key, value };
                  }) || [],
                  usagePrecautions: row.usagePrecautions,
                  reviews: row.reviews?.split(';').map((rev: string) => {
                      const [author, rating, text, createdAt] = rev.split(':');
                      return { author, rating: Number(rating), text, createdAt };
                  }) || [],
                  exchangeReturnInfo: row.exchangeReturnInfo,
                  createdAt: serverTimestamp()
                };
                batch.set(docRef, productData);
              });
              await batch.commit();
              toast({ title: '성공!', description: `${data.length}개의 상품이 성공적으로 등록되었습니다.` });
            } catch (err) {
              console.error(err);
              const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
              setError(`업로드 실패: ${message}`);
            }
          },
          error: (err) => {
            setError(`파일 읽기 오류: ${err.message}`);
          }
        });
    });
  };

  const handleBulkDownload = async () => {
    startProcessingTransition(async () => {
        try {
            const querySnapshot = await getDocs(query(collection(db, "ai_products"), orderBy("createdAt", "desc")));
            const productsToExport = querySnapshot.docs.map(doc => doc.data() as AiProduct);

            const formattedData = productsToExport.map(p => ({
                source: p.source,
                name: p.name,
                price: p.price,
                mainImageUrl: p.mainImageUrl,
                thumbnailImageUrls: p.thumbnailImageUrls.join('|'),
                shippingInfo: p.shippingInfo,
                options: p.options.map(o => `${o.name}:${o.values.join(',')}`).join(';'),
                summaryBannerImageUrl: p.summaryBanner.imageUrl,
                summaryBannerKeyPoints: p.summaryBanner.keyPoints.join('|'),
                detailImageUrls: p.detailImageUrls.join('|'),
                specifications: p.specifications.map(s => `${s.key}:${s.value}`).join(';'),
                usagePrecautions: p.usagePrecautions,
                reviews: p.reviews.map(r => `${r.author}:${r.rating}:${r.text}:${r.createdAt}`).join(';'),
                exchangeReturnInfo: p.exchangeReturnInfo,
            }));
            
            const csv = Papa.unparse(formattedData);
            const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "ai_products.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "다운로드 성공!", description: "AI 상품 목록이 CSV 파일로 저장되었습니다." });

        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
            setError(`다운로드 실패: ${message}`);
        }
    });
  };

  const handleSampleDownload = () => {
    const blob = new Blob(["\uFEFF" + sampleAiProductsCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "ai_products_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSelectionChange = (productId: string, checked: boolean) => {
    setSelectedProductIds(prev => 
      checked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(products.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleBulkEnrich = () => {
    if (selectedProductIds.length === 0) {
        toast({ title: '오류', description: '상세화할 상품을 먼저 선택해주세요.', variant: 'destructive' });
        return;
    }
    
    startEnrichingTransition(async () => {
        toast({ title: 'AI 상세화 작업 시작', description: `${selectedProductIds.length}개 상품의 상세 정보 생성을 시작합니다.` });
        
        const productsToEnrich = products.filter(p => selectedProductIds.includes(p.id));
        
        try {
            const enrichmentPromises = productsToEnrich.map(product => 
                enrichProduct({ name: product.name, price: product.price })
            );
            
            const results = await Promise.all(enrichmentPromises);
            
            const batch = writeBatch(db);
            productsToEnrich.forEach((product, index) => {
                const docRef = doc(db, 'ai_products', product.id);
                const enrichedData = results[index];
                batch.update(docRef, { ...enrichedData, updatedAt: serverTimestamp() });
            });
            
            await batch.commit();

            toast({ title: 'AI 상세화 성공!', description: `${productsToEnrich.length}개 상품의 정보가 성공적으로 업데이트되었습니다.` });
            setSelectedProductIds([]);
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
            setError(`AI 상세화 실패: ${message}`);
            toast({ title: 'AI 상세화 실패', description: message, variant: 'destructive' });
        }
    });
  };

  const handleGenerateImage = async (product: AiProduct) => {
    setIsGeneratingImage(product.id);
    try {
      const { publicUrl } = await generateAndUploadProductImage({
        productId: product.id,
        productName: product.name,
      });

      const productRef = doc(db, 'ai_products', product.id);
      await updateDoc(productRef, { mainImageUrl: publicUrl });

      toast({
        title: "이미지 생성 및 교체 완료!",
        description: `${product.name}의 이미지가 성공적으로 업데이트되었습니다.`,
      });

    } catch (e) {
      const error = e instanceof Error ? e.message : '알 수 없는 오류';
      toast({
        title: '이미지 생성 실패',
        description: error,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(null);
    }
  };

  const handleDeleteClick = (product: AiProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!productToDelete) return;

    startDeletingTransition(async () => {
      try {
        await deleteDoc(doc(db, 'ai_products', productToDelete.id));
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


  const disabled = isProcessing || isEnriching || isGeneratingImage !== null || isDeleting;

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot />[AI] 상품 관리</CardTitle>
          <CardDescription>
            네이버/쿠팡 등 외부 채널의 인기 상품을 기반으로 생성된 AI 상품 데이터를 관리합니다.
            CSV 파일을 이용해 상품을 대량으로 등록하거나 다운로드할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={handleBulkEnrich} disabled={disabled || selectedProductIds.length === 0}>
              {isEnriching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              선택 상품 일괄 상세화
            </Button>
            <Button onClick={handleBulkUpload} disabled={disabled}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              대량 등록 (CSV)
            </Button>
            <Button onClick={handleSampleDownload} disabled={disabled} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              샘플 양식 다운로드
            </Button>
            <Button onClick={handleBulkDownload} disabled={disabled} variant="secondary">
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              전체 데이터 다운로드
            </Button>
          </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>오류 발생</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isEnriching && (
                <Alert className="mb-6">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <AlertTitle>AI가 작업 중입니다...</AlertTitle>
                  <AlertDescription>선택된 상품들의 상세 정보를 생성하고 있습니다. 잠시만 기다려주세요.</AlertDescription>
                </Alert>
            )}

          <h3 className="text-lg font-semibold mb-4">AI 상품 목록</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                     <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAllChange}
                        aria-label="모두 선택"
                     />
                  </TableHead>
                  <TableHead className="w-[80px]">이미지</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead>출처</TableHead>
                  <TableHead className="text-right">가격</TableHead>
                  <TableHead className="w-[200px] text-center">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-16 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      등록된 AI 상품이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                  <TableRow key={product.id} data-state={selectedProductIds.includes(product.id) && "selected"}>
                    <TableCell className="text-center">
                        <Checkbox
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={(checked) => handleSelectionChange(product.id, !!checked)}
                            aria-label={`${product.name} 선택`}
                        />
                    </TableCell>
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
                    <TableCell>
                      <span className={cn('text-xs font-bold p-1 rounded', 
                        product.source === 'Coupang' && 'bg-blue-100 text-blue-800',
                        product.source === 'Naver Shopping' && 'bg-green-100 text-green-800',
                        product.source === 'AI-Generated' && 'bg-purple-100 text-purple-800'
                      )}>{product.source}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.price.toLocaleString()}원
                    </TableCell>
                     <TableCell className="text-center space-x-1">
                        {product.mainImageUrl.includes('placehold.co') && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleGenerateImage(product)}
                            disabled={disabled}
                            title="AI 이미지 생성 및 교체"
                          >
                            {isGeneratingImage === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                          </Button>
                        )}
                        <Button asChild variant="outline" size="icon" title="상품 수정">
                            <Link href={`/admin/ai-product-manage/${product.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(product)}
                          disabled={disabled}
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
              이 작업은 되돌릴 수 없습니다. 상품 '{productToDelete?.name}'이(가) 서버에서 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
               {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    
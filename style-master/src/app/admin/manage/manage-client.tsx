
"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import Papa from "papaparse";
import { sampleProductsCsv } from "@/lib/seed-data-csv-sample";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Trash2, UploadCloud, Download, Sparkles, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// NEW: Zod schema updated to include all editable fields
const updateProductSchema = z.object({
  name: z.string().min(2, "상품명은 2자 이상이어야 합니다."),
  price: z.coerce.number().positive("가격은 0보다 커야 합니다."),
  description: z.string().min(10, "상품 설명은 10자 이상이어야 합니다."),
  category: z.enum(["latest", "popular", "all"], {
    required_error: "카테고리를 선택해주세요.",
  }),
  imageUrl: z.string().url("유효한 이미지 URL을 입력해주세요."),
});

function ProductRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-16 w-16 rounded-md" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-48" />
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </TableCell>
        </TableRow>
    );
}

export function ManageClient() {
  const { toast } = useToast();
  const [isEditPending, startEditTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isProcessing, startProcessingTransition] = useTransition();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const form = useForm<z.infer<typeof updateProductSchema>>({
    resolver: zodResolver(updateProductSchema),
  });
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
        const productsCollection = collection(db, 'products');
        const q = query(productsCollection);
        const snapshot = await getDocs(q);
        
        let productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        productsList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

        setProducts(productsList);
    } catch (error) {
        console.error("Error fetching products:", error);
        toast({
            title: "오류",
            description: "상품 목록을 불러오는 데 실패했습니다.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    // NEW: Reset form with all product data
    form.reset({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const onEditSubmit = (values: z.infer<typeof updateProductSchema>) => {
    if (!selectedProduct) return;

    startEditTransition(async () => {
      try {
        const docRef = doc(db, "products", selectedProduct.id);
        const dataAiHint = values.name.split(' ').slice(0, 2).join(' ');

        // NEW: Update with all fields from the form
        await updateDoc(docRef, {
          ...values, // This now includes name, price, description, category, imageUrl
          dataAiHint,
          updatedAt: serverTimestamp(),
        });
        
        toast({
          title: "성공!",
          description: "상품 정보가 성공적으로 수정되었습니다.",
        });
        setIsEditDialogOpen(false);
        fetchProducts(); // Re-fetch data
      } catch (error) {
        console.error("Error updating product:", error);
        toast({
          title: "오류",
          description: "상품 수정에 실패했습니다. Firestore 보안 규칙을 확인해주세요.",
          variant: "destructive",
        });
      }
    });
  };

  const onDeleteConfirm = () => {
    if (!selectedProduct) return;

    startDeleteTransition(async () => {
      try {
        const docRef = doc(db, 'products', selectedProduct.id);
        await deleteDoc(docRef);

        toast({
          title: "성공!",
          description: "상품이 성공적으로 삭제되었습니다.",
        });
        setIsDeleteDialogOpen(false);
        fetchProducts(); // Re-fetch data
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "오류",
          description: "상품 삭제에 실패했습니다. Firestore 보안 규칙을 확인해주세요.",
          variant: "destructive",
        });
      }
    });
  };

  const handleBulkUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        parseAndUploadCsv(target.files[0]);
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
              const collectionRef = collection(db, "products");
              data.forEach(row => {
                const docRef = doc(collectionRef);
                const dataAiHint = row.name ? (row.name as string).split(' ').slice(0, 2).join(' ') : 'product';
                const productData = {
                  name: row.name,
                  price: Number(row.price),
                  description: row.description,
                  category: row.category,
                  imageUrl: row.imageUrl,
                  dataAiHint: dataAiHint,
                  createdAt: serverTimestamp()
                };
                batch.set(docRef, productData);
              });
              await batch.commit();
              toast({ title: '성공!', description: `${data.length}개의 상품이 성공적으로 등록되었습니다.` });
              fetchProducts(); // Refresh list
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
            const csv = Papa.unparse(products.map(p => ({
                name: p.name,
                price: p.price,
                description: p.description,
                category: p.category,
                imageUrl: p.imageUrl,
            })));
            const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "products.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "다운로드 성공!", description: "상품 목록이 CSV 파일로 저장되었습니다." });

        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
            setError(`다운로드 실패: ${message}`);
        }
    });
  };

  const handleSampleDownload = () => {
    const blob = new Blob(["\uFEFF" + sampleProductsCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "products_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const disabled = isProcessing || isEditPending || isDeletePending;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <Button disabled>
          <Sparkles className="mr-2 h-4 w-4" />
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">이미지</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead className="text-right w-[150px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <>
                    <ProductRowSkeleton />
                    <ProductRowSkeleton />
                    <ProductRowSkeleton />
                </>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  등록된 상품이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                      data-ai-hint={product.dataAiHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(product)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* NEW: Edit Dialog with more fields */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>상품 정보 수정</DialogTitle>
            <DialogDescription>상품의 모든 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상품명</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isEditPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>가격</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isEditPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상품 설명</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isEditPending} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="latest">최신</SelectItem>
                        <SelectItem value="popular">인기</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이미지 URL</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isEditPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                  <DialogClose asChild>
                      <Button type="button" variant="secondary">취소</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isEditPending}>
                    {isEditPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    저장하기
                  </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 이 상품 데이터가 서버에서 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteConfirm} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
               {isDeletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

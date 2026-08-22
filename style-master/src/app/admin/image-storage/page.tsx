
"use client";

import { useState, useEffect, useTransition, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { auth, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { GalleryHorizontal, UploadCloud, Copy, Trash2, Loader2, Frown, AlertCircle } from 'lucide-react';
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

type UploadedImage = {
    url: string;
    name: string;
};

export default function ImageStoragePage() {
    const { toast } = useToast();
    const [isUploading, startUploadingTransition] = useTransition();
    const [isDeleting, startDeletingTransition] = useTransition();

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    
    const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);
    const [isGalleryLoading, setIsGalleryLoading] = useState(true);
    const [galleryError, setGalleryError] = useState<string | null>(null);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // State for delete dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<UploadedImage | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                fetchGalleryImages();
            } else {
                setIsGalleryLoading(false);
                setGalleryError("이미지 갤러리를 보려면 로그인이 필요합니다.");
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchGalleryImages = async () => {
        setIsGalleryLoading(true);
        setGalleryError(null);
        try {
            const listRef = ref(storage, 'uploads/');
            const res = await listAll(listRef);
            const urlPromises = res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return { url, name: itemRef.name };
            });
            const images = await Promise.all(urlPromises);
            // Sort by name descending to get latest uploads first
            images.sort((a, b) => b.name.localeCompare(a.name));
            setGalleryImages(images);
        } catch (error) {
            console.error("Error fetching gallery images:", error);
            setGalleryError("갤러리 이미지를 불러오는 중 오류가 발생했습니다. 권한을 확인해주세요.");
        } finally {
            setIsGalleryLoading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setUploadedFiles(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp'] }
    });
    
    const handleUpload = () => {
        if (uploadedFiles.length === 0) return;

        startUploadingTransition(async () => {
            setUploadProgress(0);
            
            try {
                // Ensure anonymous sign-in if no user is logged in
                if (!auth.currentUser) {
                    await signInAnonymously(auth);
                }

                const uploadPromises = uploadedFiles.map(file => {
                    const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    return new Promise<void>((resolve, reject) => {
                        uploadTask.on('state_changed',
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                setUploadProgress(progress);
                            },
                            (error) => {
                                console.error("Upload failed:", error);
                                reject(error);
                            },
                            () => {
                                resolve();
                            }
                        );
                    });
                });
                
                await Promise.all(uploadPromises);

                toast({ title: '업로드 성공!', description: `${uploadedFiles.length}개의 이미지가 성공적으로 업로드되었습니다.` });
                setUploadedFiles([]);
                setUploadProgress(null);
                if (currentUser) fetchGalleryImages(); // Refresh gallery if user is logged in
            } catch (error) {
                console.error("Error during upload process:", error);
                toast({ title: '업로드 실패', description: '이미지 업로드 중 오류가 발생했습니다.', variant: 'destructive' });
                setUploadProgress(null);
            }
        });
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: 'URL 복사 완료!', description: '이미지 URL이 클립보드에 복사되었습니다.' });
    };

    const handleDeleteClick = (image: UploadedImage) => {
        setImageToDelete(image);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!imageToDelete) return;

        startDeletingTransition(async () => {
            try {
                const imageRef = ref(storage, `uploads/${imageToDelete.name}`);
                await deleteObject(imageRef);
                toast({
                    title: "삭제 완료",
                    description: `이미지 '${imageToDelete.name}'이(가) 성공적으로 삭제되었습니다.`,
                });
                fetchGalleryImages(); // Refresh gallery
            } catch (err) {
                toast({
                    title: "삭제 실패",
                    description: `이미지 삭제 중 오류가 발생했습니다: ${err instanceof Error ? err.message : 'Unknown error'}`,
                    variant: "destructive",
                });
            } finally {
                setIsDeleteDialogOpen(false);
                setImageToDelete(null);
            }
        });
    };

    return (
        <div className="container py-12">
            <div className="space-y-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UploadCloud className="h-6 w-6 text-primary" />
                             이미지 업로드
                        </CardTitle>
                        <CardDescription>
                            로컬 컴퓨터에서 이미지를 선택하거나 드래그하여 업로드합니다. 업로드는 익명으로 처리됩니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                            <input {...getInputProps()} />
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-md">업로드할 파일을 드래그하거나 클릭하세요</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WEBP</p>
                        </div>
                        {uploadedFiles.length > 0 && (
                            <div>
                                <h4 className="font-semibold">선택된 파일:</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {uploadedFiles.map(file => <li key={file.name}>{file.name}</li>)}
                                </ul>
                            </div>
                        )}
                        {uploadProgress !== null && <Progress value={uploadProgress} className="w-full" />}
                         <Button onClick={handleUpload} disabled={isUploading || uploadedFiles.length === 0} className="w-full">
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                            {isUploading ? `${Math.round(uploadProgress || 0)}% 업로드 중...` : `${uploadedFiles.length}개 파일 업로드`}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GalleryHorizontal className="h-6 w-6 text-primary" />
                            이미지 갤러리
                        </CardTitle>
                        <CardDescription>
                            업로드된 이미지 목록입니다. 갤러리 조회는 로그인한 사용자만 가능합니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isGalleryLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
                            </div>
                        ) : galleryError ? (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>오류</AlertTitle>
                                <AlertDescription>{galleryError}</AlertDescription>
                            </Alert>
                        ) : galleryImages.length === 0 ? (
                            <div className="text-center py-10 bg-muted rounded-lg">
                               <Frown className="mx-auto h-10 w-10 text-muted-foreground" />
                               <p className="mt-4 text-md text-muted-foreground">업로드된 이미지가 없습니다.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {galleryImages.map((image) => (
                                    <Card key={image.url} className="group relative">
                                        <CardContent className="p-2">
                                            <div className="aspect-square w-full rounded-md overflow-hidden relative">
                                                <Image src={image.url} alt={image.name} fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="secondary" onClick={() => copyToClipboard(image.url)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="destructive" onClick={() => handleDeleteClick(image)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-2 pt-0">
                                             <Input
                                                readOnly
                                                value={image.url}
                                                className="text-xs h-8 truncate"
                                                onClick={(e) => e.currentTarget.select()}
                                            />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 스토리지에서 이미지가 영구적으로 삭제됩니다.
                    <br/>
                    <strong>파일: {imageToDelete?.name}</strong>
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

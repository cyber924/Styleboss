

"use client";

import { useState, useEffect, useTransition } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Frown, Users2, Trash2, Edit, Save, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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

export default function CustomerManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // For delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);


  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UserProfile));
        setUsers(usersList);
        setIsLoading(false);
      }, 
      (err) => {
        console.error("Error fetching users:", err);
        setError("고객 목록을 불러오는 데 실패했습니다. Firestore 권한을 확인해주세요.");
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);
  
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'yyyy-MM-dd HH:mm');
  }

  const handleGradeChange = (userId: string, newGrade: UserProfile['grade']) => {
    startUpdateTransition(async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { grade: newGrade });
        toast({
          title: "등급 변경 성공",
          description: `고객 등급이 ${newGrade}(으)로 변경되었습니다.`,
        });
      } catch (e) {
        const error = e instanceof Error ? e.message : "알 수 없는 오류";
        toast({
          title: "등급 변경 실패",
          description: error,
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;

    startDeleteTransition(async () => {
      // NOTE: This only deletes the Firestore user profile document.
      // The Firebase Auth user is not deleted. 
      // A Cloud Function would be needed for complete user deletion.
      try {
        await deleteDoc(doc(db, 'users', userToDelete.id));
        toast({
          title: "삭제 완료",
          description: `고객 프로필 '${userToDelete.displayName}'이(가) 성공적으로 삭제되었습니다.`,
        });
      } catch (err) {
        toast({
          title: "삭제 실패",
          description: `프로필 삭제 중 오류가 발생했습니다: ${err instanceof Error ? err.message : 'Unknown error'}`,
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    });
  };

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            고객 관리
          </CardTitle>
          <CardDescription>
            쇼핑몰에 가입하거나 로그인한 고객의 목록입니다. 고객 등급을 관리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>오류 발생</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>등급</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>마지막 로그인</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Frown className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        아직 등록된 고객이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.displayName}</TableCell>
                        <TableCell>
                          <Select defaultValue={user.grade} onValueChange={(value) => handleGradeChange(user.id, value as UserProfile['grade'])} disabled={isUpdating}>
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue/>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Basic">Basic</SelectItem>
                                <SelectItem value="Premium">Premium</SelectItem>
                                <SelectItem value="VIP">VIP</SelectItem>
                              </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(user)} disabled={isDeleting}>
                             {isDeleting && userToDelete?.id === user.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                    </TableRow>
                  ))
                )}
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
              이 작업은 되돌릴 수 없습니다. '{userToDelete?.displayName}' 고객의 프로필 정보만 삭제되며, 로그인 계정 자체는 삭제되지 않습니다.
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

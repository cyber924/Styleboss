

"use client";

import { useState, useEffect, useTransition } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile, ProductCategory } from '@/lib/types';
import { productCategories } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, User, Mail, Calendar, LogInIcon, BadgeCheck, Phone, Home, Edit, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

const profileFormSchema = z.object({
  realName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  preferredCategories: z.array(z.string()).optional(),
});

function ProfileItem({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string, value: string | undefined | React.ReactNode, highlight?: boolean }) {
    return (
        <div className="flex items-start gap-4">
            <div className="text-muted-foreground pt-1">{icon}</div>
            <div className="flex-grow">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className={`font-semibold ${highlight ? 'text-primary' : ''}`}>{value || '정보 없음'}</div>
            </div>
        </div>
    );
}

export default function MyInfoPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isSubmitting, startSubmittingTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      preferredCategories: [],
    },
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login?redirect=/my-info');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const profileData = { id: docSnap.id, ...docSnap.data() } as UserProfile;
          setUserProfile(profileData);
          form.reset({
            realName: profileData.realName || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            preferredCategories: profileData.preferredCategories || [],
          });
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      });
      return () => unsubscribeProfile();
    }
  }, [user, form]);

  const onSubmit = (values: z.infer<typeof profileFormSchema>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
  
    startSubmittingTransition(async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { 
          realName: values.realName || '',
          phone: values.phone || '',
          address: values.address || '',
          preferredCategories: values.preferredCategories || [],
          updatedAt: serverTimestamp(),
        });
        toast({
          title: "성공",
          description: "상세 정보가 성공적으로 업데이트되었습니다.",
        });
        setIsDialogOpen(false);
      } catch (e) {
        toast({
          title: "오류",
          description: `업데이트에 실패했습니다: ${e instanceof Error ? e.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    });
  };

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'yyyy년 MM월 dd일 HH:mm');
  }

  if (loading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <User className="h-7 w-7 text-primary"/>
            내 정보
          </CardTitle>
          <CardDescription>
            회원님의 계정 및 상세 프로필 정보입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile ? (
            <>
              <div className="space-y-4">
                <ProfileItem icon={<Mail size={20}/>} label="이메일" value={userProfile.email} />
                <ProfileItem icon={<User size={20}/>} label="이름 (표시명)" value={userProfile.displayName} />
                <ProfileItem icon={<BadgeCheck size={20}/>} label="고객 등급" value={userProfile.grade} highlight />
              </div>
              <div className="border-t pt-4 mt-4 space-y-4">
                <ProfileItem icon={<Calendar size={20}/>} label="가입일" value={formatDate(userProfile.createdAt)} />
                <ProfileItem icon={<LogInIcon size={20}/>} label="마지막 로그인" value={formatDate(userProfile.lastLoginAt)} />
              </div>
              <div className="border-t pt-4 mt-4 space-y-4">
                 <h3 className="text-lg font-semibold text-muted-foreground">추가 정보</h3>
                <ProfileItem icon={<User size={20}/>} label="실명" value={userProfile.realName} />
                <ProfileItem icon={<Phone size={20}/>} label="연락처" value={userProfile.phone} />
                <ProfileItem icon={<Home size={20}/>} label="주소" value={userProfile.address} />
                <ProfileItem 
                  icon={<Sparkles size={20}/>} 
                  label="선호 스타일" 
                  value={
                    <div className="flex flex-wrap gap-2">
                      {(userProfile.preferredCategories && userProfile.preferredCategories.length > 0) ? (
                        userProfile.preferredCategories.map(cat => (
                          <span key={cat} className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">{cat}</span>
                        ))
                      ) : (
                        '선택된 스타일 없음'
                      )}
                    </div>
                  } 
                />
              </div>
            </>
          ) : (
             <Alert variant="destructive">
                <AlertTitle>프로필 정보 없음</AlertTitle>
                <AlertDescription>
                    사용자 프로필을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Edit className="mr-2 h-4 w-4"/>상세 정보 관리</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>상세 정보 관리</DialogTitle>
                  <DialogDescription>
                    배송정보 및 추천 서비스에 사용될 정보를 관리합니다.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-4">
                     <FormField control={form.control} name="realName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>실명</FormLabel>
                        <FormControl><Input placeholder="김사장" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>연락처</FormLabel>
                        <FormControl><Input placeholder="010-1234-5678" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>주소</FormLabel>
                        <FormControl><Input placeholder="서울특별시 강남구 테헤란로" {...field} value={field.value || ''}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField
                      control={form.control}
                      name="preferredCategories"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">선호 스타일</FormLabel>
                            <p className="text-sm text-muted-foreground">관심있는 상품 종류를 선택하시면, 관련 핫딜 상품을 먼저 보여드려요.</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                          {productCategories.map((item) => (
                            <FormField
                              key={item}
                              control={form.control}
                              name="preferredCategories"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item}
                                    className="flex flex-row items-center space-x-2 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), item])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="!mt-8">
                      <DialogClose asChild><Button type="button" variant="secondary">취소</Button></DialogClose>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        저장하기
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

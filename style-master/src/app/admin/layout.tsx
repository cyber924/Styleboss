

"use client"

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PlusSquare, Database, Sparkles, ClipboardList, ImagePlus, BarChart3, Plug, MessageSquareQuote, Images, UploadCloud, TrendingUp, GalleryHorizontal, Loader2, Bot, Replace, Flame, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Shirt } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const navItems = [
    { href: "/admin", label: "대시보드", icon: LayoutDashboard },
    { href: "/admin/register", label: "상품 등록", icon: PlusSquare },
    { href: "/admin/ai-product-creation", label: "[AI] 상품 기획", icon: Bot },
    { href: "/admin/manage", label: "상품 관리", icon: ClipboardList },
    { href: "/admin/ai-product-manage", label: "[AI] 상품 관리", icon: Bot },
    { href: "/admin/hot-product-manage", label: "[핫딜] 상품 관리", icon: Flame },
    { href: "/admin/image-generation", label: "AI 이미지 생성", icon: ImagePlus },
    { href: "/admin/similar-image-generation", label: "유사 이미지 생성", icon: Images },
    { href: "/admin/image-bulk-replace", label: "이미지 일괄 교체", icon: Replace },
    { href: "/admin/sns-generation", label: "AI SNS 생성", icon: MessageSquareQuote },
    { href: "/admin/trends", label: "AI 트렌드 추천", icon: Sparkles },
    { href: "/admin/market-research", label: "AI 시장 분석", icon: BarChart3 },
    { href: "/admin/sales-analysis", label: "AI 매출 분석", icon: TrendingUp },
    { href: "/admin/image-storage", label: "이미지 스토리지", icon: GalleryHorizontal },
    { href: "/admin/customer-management", label: "고객 관리", icon: Users },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // If not logged in, redirect to login page.
        router.push("/login?redirect=/admin");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);
  
  if (loading) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">인증 상태를 확인하는 중...</p>
          </div>
      );
  }
  
  if (!user) {
      // This part might briefly show while redirecting.
      // Or you can return null to show a blank screen during redirection.
      return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center space-x-2 p-2">
              <Shirt className="h-6 w-6 text-primary" />
              <span className="font-bold group-data-[collapsible=icon]:hidden">StyleWise Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col sm:gap-4 sm:py-4">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
              <SidebarTrigger/>
              <span className="font-semibold">관리자 메뉴</span>
            </header>
            <SidebarInset>
              {children}
            </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

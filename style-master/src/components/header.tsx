
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, Sparkles, X, Shirt, LogOut, UserPlus, LogIn, Bot, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const ADMIN_EMAIL = "cyber924@naver.com";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "로그아웃 성공", description: "성공적으로 로그아웃되었습니다." });
      router.push('/');
    } catch (error) {
      toast({ title: "로그아웃 실패", description: "로그아웃 중 문제가 발생했습니다.", variant: "destructive" });
    }
  };


  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };
  
  const isAdmin = user && user.email === ADMIN_EMAIL;

  const baseNavLinks = [
    { name: "최신", href: "/products?category=latest" },
    { name: "인기", href: "/products?category=popular" },
    { name: "핫", href: "/hot" },
    { name: "AI 상품", href: "/ai-products" },
    { name: "전체", href: "/products" },
    { name: "AI 코디", href: "/ai-codi" },
    { name: "AI 스타일리스트", href: "/stylist" },
    ...(isAdmin ? [{ name: "어드민", href: "/admin" }] : []),
  ];
  
  const mobileBaseNavLinks = [ ...baseNavLinks, { name: "내 상품", href: "/my-products" }];

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode, onClick?: () => void }) => (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-primary pb-1",
        pathname === href
          ? "font-bold text-primary border-b-2 border-primary"
          : "text-foreground/80"
      )}
      onClick={() => {
        onClick?.();
        setIsMenuOpen(false)
      }}
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Shirt className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">StyleWise AI</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {baseNavLinks.map((link) => (
              <NavLink key={link.name} href={link.href}>
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="AI에게 상품 찾아달라고 하기..."
                  className="w-full pl-9 md:w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          <nav className="hidden md:flex items-center space-x-2">
             {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-auto px-4 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'}/>
                            <AvatarFallback>{(user.displayName || user.email || 'U').charAt(0)}</AvatarFallback>
                        </Avatar>
                      <span>{user.displayName || user.email?.split('@')[0]}님</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium leading-none">환영합니다!</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-products"><ShoppingCart className="mr-2 h-4 w-4" />내 상품 (장바구니)</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-info"><User className="mr-2 h-4 w-4" />내 정보</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">로그인</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/signup">회원가입</Link>
                  </Button>
                </>
              )}
          </nav>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="px-2 md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
             <Link href="/" className="flex items-center space-x-2 md:hidden">
                <Shirt className="h-6 w-6 text-primary" />
                <span className="font-bold">StyleWise AI</span>
             </Link>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex justify-between items-center mb-6">
                 <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                    <Shirt className="h-6 w-6 text-primary" />
                    <span className="font-bold">StyleWise AI</span>
                </Link>
                <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">메뉴 닫기</span>
                    </Button>
                </SheetClose>
              </div>
              <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
              <nav className="flex flex-col space-y-4 text-lg font-medium">
                {mobileBaseNavLinks.map((link) => (
                  <NavLink key={link.name} href={link.href}>
                    {link.name}
                  </NavLink>
                ))}
                <div className="border-t pt-4 space-y-2">
                    {user ? (
                        <>
                         <Button asChild variant="outline" className="w-full justify-start text-base">
                            <Link href="/my-info" onClick={() => setIsMenuOpen(false)}><User className="mr-2 h-5 w-5"/>내 정보</Link>
                        </Button>
                        <Button onClick={() => {handleLogout(); setIsMenuOpen(false);}} variant="outline" className="w-full justify-start text-base">
                            <LogOut className="mr-2 h-5 w-5"/>로그아웃
                        </Button>
                        </>
                    ) : (
                        <>
                        <Button asChild variant="outline" className="w-full justify-start text-base">
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}><LogIn className="mr-2 h-5 w-5"/>로그인</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start text-base">
                            <Link href="/signup" onClick={() => setIsMenuOpen(false)}><UserPlus className="mr-2 h-5 w-5"/>회원가입</Link>
                        </Button>
                        </>
                    )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

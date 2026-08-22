import Link from "next/link";
import { Shirt, Github, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center space-x-2">
            <Shirt className="h-6 w-6 text-primary" />
            <p className="text-center text-sm leading-loose md:text-left font-bold">
              StyleWise AI
            </p>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="#" target="_blank" rel="noreferrer">
            <Github className="h-5 w-5 hover:text-primary transition-colors" />
          </Link>
          <Link href="#" target="_blank" rel="noreferrer">
            <Twitter className="h-5 w-5 hover:text-primary transition-colors" />
          </Link>
          <Link href="#" target="_blank" rel="noreferrer">
            <Instagram className="h-5 w-5 hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

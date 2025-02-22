"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { usePathname } from "next/navigation";
import { githubSignIn, userSignOut } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const { data: session, status } = useSession();
  const router = useRouter();

  if (isDashboard) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Promoter AI
            </span>
          </Link>
          <MainNav />
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full cursor-pointer"
                    referrerPolicy="no-referrer"
                  />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-[160px]">
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full px-4 py-2 text-sm hover:bg-accent text-left cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </DropdownMenuItem>
                <form action={async () => {
                  await userSignOut();
                  router.refresh();
                }}>
                  <DropdownMenuItem asChild>
                    <button 
                      type="submit" 
                      className="w-full px-4 py-2 text-sm text-destructive-foreground bg-destructive hover:bg-destructive/90 text-left cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <form action={githubSignIn}>
              <Button type="submit" variant="outline">
                Sign In
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}

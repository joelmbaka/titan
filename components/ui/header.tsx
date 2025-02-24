"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { usePathname } from "next/navigation";
import { githubSignIn, userSignOut } from "@/lib/actions";
import { useSession, signIn, signOut } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Debug logging for session state
  useEffect(() => {
    console.log("Header session state:", {
      status,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id || "none",
      route: pathname
    });
    setMounted(true);
  }, [session, status, pathname]);

  // Fix for hydration mismatch
  if (!mounted) return null;

  // Handle sign in click with debug logging
  const handleSignIn = async () => {
    console.log("Sign in button clicked");
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  // Handle sign out click with debug logging
  const handleSignOut = async () => {
    console.log("Sign out button clicked");
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

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
          {status === "loading" ? (
            // Loading state
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : session ? (
            // User is signed in
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={session.user?.image || ""} 
                      alt={session.user?.name || "User"} 
                    />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={handleSignOut}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // User is not signed in
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSignIn}
              data-testid="signin-button"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

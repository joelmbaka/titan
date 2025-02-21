import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { auth } from "@/auth";
import { githubSignIn, userSignOut } from "@/lib/actions";

export default async function Header() {
  const session = await auth();
  const isAuthenticated = !!session;

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
          {isAuthenticated ? (
            <form action={userSignOut}>
              <Button type="submit" variant="outline">
                Sign Out
              </Button>
            </form>
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

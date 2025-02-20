"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 space-y-6">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          Welcome to the GRAND Stack
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          This project demonstrates integrating Neo4j Adapter with Next.js 15, 
          featuring Auth.js authentication and session management on the database. 
        </p>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button asChild className="w-full">
          <Link href="/signin">Sign In with GitHub</Link>
        </Button>
        
        <Button
          variant="outline"
          onClick={() =>
            navigator.clipboard.writeText("git clone https://github.com/joelmbaka/neo4j-tunnel.git")
          }
          className="group flex items-center gap-2 w-full truncate"
          role="button"
          aria-label="Copy clone command"
        >
          <span className="truncate">git clone https://github.com/joelmbaka/neo4j-tunnel.git</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

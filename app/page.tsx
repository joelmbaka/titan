"use client";

import { Button } from "@/components/ui/button";
import { githubSignIn } from "@/lib/actions";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold">Welcome to the GRAND stack</h1>
        <h3 className="mt-4">
          This project is a simple example of how to use Neo4j Adapter with
          Next.js 15. It uses GitHub authentication and stores the user&apos;s data in
          Neo4j. Uses strategy: database mutate the user email and name in the
          database graph.
        </h3>
      </div>
      <form action={githubSignIn}>
        <Button className="mt-4" >
          Sign In with GitHub
        </Button>
      </form>

      <Button
        variant="outline"
        onClick={() =>
          navigator.clipboard.writeText("git clone https://github.com/joelmbaka/neo4j-tunnel.git")
        }
        className="flex items-center gap-2 mt-4"
      >
        <span>git clone https://github.com/joelmbaka/neo4j-tunnel.git</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        
      </Button>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { AddStoreModal } from "@/components/add-store-modal";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { githubSignIn } from "@/lib/actions";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);

  useEffect(() => {
    // Only do the redirect if we're on the root page
    if (pathname !== '/') {
      return;
    }
    
    // Check if we're on a subdomain by looking at the hostname
    const isSubdomain = window.location.hostname.split('.').length > 2 && 
                        !window.location.hostname.startsWith('www.');
    
    // Skip redirection if we're on a subdomain - let the middleware handle it
    if (isSubdomain) {
      console.log('On subdomain, skipping client-side redirect');
      return;
    }
    
    // Check if we have a subdomain cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const subdomain = getCookie('subdomain');
    
    if (subdomain) {
      console.log('Subdomain cookie detected:', subdomain);
      console.log('Redirecting to store page...');
      
      // Redirect to the store page
      router.push(`/store/${subdomain}`);
    }
  }, [router, pathname]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto text-center py-32">
        <h1 className="text-6xl font-bold mb-8">
          Automate Your Entire Business with AI Agents
        </h1>
        <p className="text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto">
          Deploy specialized AI team members to handle content creation, marketing, sales, 
          and operations while you focus on growth.
        </p>

        <div className="flex gap-6 justify-center mb-24">
          <Button 
            size="lg" 
            onClick={() => setShowAddStoreModal(true)}
          >
            Get Started Free
          </Button>
          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </div>

        {/* AI Agent Grid */}
        <div className="grid grid-cols-3 gap-8 mb-32">
          <Card className="p-8 hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-4">🤖 Content Team</h3>
            <p className="text-base text-muted-foreground">
              Automated blog writing, social media posts, and product descriptions
            </p>
          </Card>
          
          <Card className="p-8 hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-4">📈 Marketing Team</h3>
            <p className="text-base text-muted-foreground">
              AI-managed ad campaigns and social media scheduling
            </p>
          </Card>
          
          <Card className="p-8 hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-4">💼 Operations Team</h3>
            <p className="text-base text-muted-foreground">
              Inventory management, HR automation, and financial oversight
            </p>
          </Card>
        </div>

        {/* Dashboard Preview */}
        <div className="relative rounded-2xl bg-muted/50 p-8">
          <div className="absolute inset-0 bg-grid-small-[#9091A1]/10" />
          <div className="relative rounded-lg overflow-hidden border">
            <div className="bg-background p-8">
              <div className="flex gap-8 mb-8">
                <div className="h-64 w-full bg-muted rounded-lg" />
                <div className="h-64 w-full bg-muted rounded-lg" />
              </div>
              <div className="h-48 w-full bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      <AddStoreModal
        open={showAddStoreModal}
        onClose={() => setShowAddStoreModal(false)}
        onAdd={async (name: string, category: string, subdomain: string) => {
          try {
            const response = await fetch('/api/stores', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name, category, subdomain }),
            });

            if (response.ok) {
              const data = await response.json();
              router.push(`/dashboard/${data.storeId}`);
            } else {
              throw new Error('Failed to create store');
            }
          } catch (error) {
            console.error('Error creating store:', error);
          }
        }}
      />

      <div className="flex justify-center py-8">
        <Button 
          size="lg" 
          onClick={async () => await githubSignIn()}
        >
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}

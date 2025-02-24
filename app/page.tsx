"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AddStoreModal } from "@/components/add-store-modal";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { githubSignIn } from "@/lib/actions";

export default function Home() {
  const router = useRouter();
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);

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
            <p className="text-base text-muted-foreground">p
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

      {/* Feature Section */}
      <section className="container mx-auto py-32">
        <h2 className="text-4xl font-bold text-center mb-24">
          Everything You Need to Run Your Online Business
        </h2>
        
        <div className="grid grid-cols-2 gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-xl bg-primary/10">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Automated Content Creation</h3>
                <p className="text-lg text-muted-foreground">
                  Generate SEO-optimized product descriptions, blog posts, 
                  and marketing copy in your brand voice
                </p>
              </div>
            </div>
            {/* Add more features in same pattern */}
          </div>
          
          <div className="bg-muted/50 rounded-2xl p-8 h-full">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-6 bg-background rounded-xl">
                <span className="text-lg">AI Agents Active</span>
                <span className="font-mono text-xl text-primary">12/12</span>
              </div>
              <div className="flex items-center justify-between p-6 bg-background rounded-xl">
                <span className="text-lg">Current Tasks</span>
                <span className="font-mono text-xl text-primary">48</span>
              </div>
              {/* Add more status items */}
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

      <Button 
        size="lg" 
        onClick={async () => await githubSignIn()}
      >
        Sign in with GitHub
      </Button>
    </div>
  );
}

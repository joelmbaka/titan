"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { OperationVariables } from "@apollo/client"

interface BlogPostModalProps {
  open: boolean
  onClose: () => void
  onGenerate: (prompt: string) => Promise<BlogPostData>
  onBlogPostAdded: (variables?: Partial<OperationVariables>) => Promise<void>
  storeId: string
}

export interface BlogPostData {
  id: string
  title: string
  content: string
  meta_description: string
  tags: string[]
  category: string
}

export function BlogPostModal({ open, onClose, onGenerate, onBlogPostAdded, storeId }: BlogPostModalProps) {
  console.log(`BlogPostModal opened: ${open}`);

  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedPost, setGeneratedPost] = useState<BlogPostData | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleGenerate = async () => {
    if (prompt.length < 200) {
      setError("Please provide at least 200 characters for better results.");
      return;
    }

    console.log(`Generating blog post with prompt: ${prompt}`);
    setLoading(true);
    setError("");
    setGeneratedPost(null);

    try {
      const result = await onGenerate(prompt);
      console.log(`Blog post generated successfully:`, result);
      
      const saveResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateBlogPost($input: CreateBlogPostInput!) {
              createBlogPost(input: $input) {
                id
                title
                content
                metaDescription
                tags
                category
                status
                createdAt
              }
            }
          `,
          variables: {
            input: {
              title: result.title,
              content: result.content,
              metaDescription: result.meta_description,
              tags: result.tags,
              category: result.category,
              storeId: storeId,
              status: 'DRAFT'
            }
          }
        })
      });

      const saveData = await saveResponse.json();
      
      if (saveData.errors) {
        throw new Error(saveData.errors[0].message);
      }

      setGeneratedPost(result)
    } catch (err) {
      console.error("Error generating blog post:", err)
      setError("Failed to generate blog post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    console.log(`BlogPostModal closed`);
    setPrompt("");
    setGeneratedPost(null);
    setShowSuccess(false);
    onClose();
  }

  const handlePublish = async () => {
    if (!generatedPost) return;

    console.log(`Publishing blog post:`, generatedPost);
    setIsPublishing(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateBlogPost($input: CreateBlogPostInput!) {
              createBlogPost(input: $input) {
                id
                status
              }
            }
          `,
          variables: {
            input: {
              title: generatedPost.title,
              content: generatedPost.content,
              metaDescription: generatedPost.meta_description,
              tags: generatedPost.tags,
              category: generatedPost.category,
              storeId: storeId,
              status: 'PUBLISHED'
            }
          }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setShowSuccess(true);
      onBlogPostAdded();
    } catch (err) {
      console.error("Error publishing article:", err);
      setError("Failed to publish article. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showSuccess ? "Blog Post Published!" : "Generate Blog Post with AI"}
          </DialogTitle>
        </DialogHeader>
        
        {showSuccess ? (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">🎉 Blog Post Published Successfully!</p>
            <Button 
              onClick={handleClose}
              className="w-full"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowSuccess(false);
                setPrompt("");
              }}
              className="w-full"
            >
              Create New Post
            </Button>
          </div>
        ) : generatedPost ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{generatedPost.title}</h2>
            <div className="prose max-w-full">
              {generatedPost.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="flex gap-2">
              {generatedPost.tags.map(tag => (
                <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
            <Button 
              onClick={handlePublish} 
              className="w-full"
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish Article"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Enter your prompt:</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Write your prompt here..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Minimum 200 characters required
              </p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button 
              onClick={handleGenerate} 
              disabled={loading || prompt.length < 200}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Blog Post"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BlogPostData, BlogPostModal } from "@/components/blog-post-modal"
import { useParams } from "next/navigation"

export default function BlogPage() {
  const params = useParams()
  if (!params) throw new Error("Params is null")
  const storeId = params.storeId as string
  const [showBlogModal, setShowBlogModal] = useState(false)
  const [blogPosts, setBlogPosts] = useState([])

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`https://titan2-o.onrender.com/blog-posts?store_id=${storeId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts")
      }
      const data = await response.json()
      setBlogPosts(data)
    } catch (error) {
      console.error("Error fetching blog posts:", error)
    }
  }

  useEffect(() => {
    fetchBlogPosts()
  }, [storeId])

  const handleGenerateBlog = async (prompt: string) => {
    try {
      console.log("Sending blog generation request with prompt:", prompt)
      const response = await fetch("https://titan2-o.onrender.com/generate-blog-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt,
          store_id: storeId
        }),
      })

      console.log("Received response status:", response.status)
      
      if (!response.ok) {
        const errorResponse = await response.json()
        console.error("Error response from server:", errorResponse)
        throw new Error(`Failed to generate blog post: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Successfully generated blog post:", data)
      return data
    } catch (err) {
      console.error("Error in handleGenerateBlog:", err)
      throw err
    }
  }

  const handlePublish = async (blogPost) => {
    try {
      const response = await fetch(`https://titan2-o.onrender.com/publish-blog-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blogPost, store_id: storeId }),
      })
      if (!response.ok) {
        throw new Error("Failed to publish blog post")
      }
      const data = await response.json()
      console.log("Successfully published blog post:", data)
      // Optionally, refetch blog posts after publishing
      fetchBlogPosts()
    } catch (error) {
      console.error("Error publishing blog post:", error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => setShowBlogModal(true)}>
          Create New Blog Post
        </Button>
      </div>

      <div>
        {blogPosts.map((post) => (
          <div key={post.id} className="mb-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p>{post.content}</p>
            <Button onClick={() => handlePublish(post)}>Publish</Button>
          </div>
        ))}
      </div>

      <BlogPostModal
        open={showBlogModal}
        onClose={() => setShowBlogModal(false)}
        onGenerate={handleGenerateBlog}
        onPublish={handlePublish}
        storeId={storeId}
      />
    </div>
  )
}

interface BlogPostModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<BlogPostData>;
  onPublish: (blogPost: any) => Promise<void>;
  storeId: string;
} 
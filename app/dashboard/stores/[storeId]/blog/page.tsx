"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BlogPostModal } from "@/components/blog-post-modal"
import { useParams } from "next/navigation"
import { getBlogPostsByStoreId } from '@/lib/storeFunctions'
import Link from 'next/link'

export default async function BlogPage() {
  const params = useParams()
  if (!params) throw new Error("Params is null")
  const storeId = params.storeId as string
  const [showBlogModal, setShowBlogModal] = useState(false)

  // Fetch blog posts for the store
  const blogPosts = await getBlogPostsByStoreId(storeId)

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => setShowBlogModal(true)}>
          Create New Blog Post
        </Button>
      </div>

      {/* Display Blog Posts */}
      {blogPosts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="p-6">
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="text-gray-600">{post.metaDescription}</p>
            <Link href={`/dashboard/stores/${storeId}/blog/${post.id}`} className="text-blue-600 hover:text-blue-800">
              Read more
            </Link>
          </div>
        </div>
      ))}

      <BlogPostModal
        open={showBlogModal}
        onClose={() => setShowBlogModal(false)}
        onGenerate={handleGenerateBlog}
        storeId={storeId}
      />
    </div>
  )
} 
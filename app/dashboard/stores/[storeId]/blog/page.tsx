"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BlogPostModal } from "@/components/blog-post-modal"
import { useParams } from "next/navigation"
import { useQuery } from "@apollo/client"
import { GET_BLOG_POSTS_QUERY } from '@/lib/graphql/queries'
import { BlogPostType } from "@/lib/types"
import { LoadingSpinner } from "@/components/loading-spinner"
import Link from 'next/link'
import { OperationVariables } from "@apollo/client"

export default function BlogPage() {
  const params = useParams()
  if (!params) throw new Error("Params is null")
  const storeId = params.storeId as string
  const [showBlogModal, setShowBlogModal] = useState(false)

  const { loading, error, data, refetch } = useQuery(GET_BLOG_POSTS_QUERY, {
    variables: { storeId },
    fetchPolicy: "cache-and-network",
  })

  const blogPosts: BlogPostType[] = data?.blogPosts || []

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

  const handleBlogPostAdded = async () => {
    await refetch(); // This should refetch the blog posts
  };

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-500">Error loading blog posts: {error.message}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => setShowBlogModal(true)}>
          Create New Blog Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogPosts.map((post) => (
          <div key={post.id} className="border p-4">
            <h2 className="font-bold">{post.title}</h2>
            <p>{post.metaDescription}</p>
            <Link href={`/dashboard/stores/${storeId}/blog/${post.id}`} className="text-blue-600 hover:text-blue-800">
              Read more
            </Link>
          </div>
        ))}
      </div>

      <BlogPostModal
        open={showBlogModal}
        onClose={() => setShowBlogModal(false)}
        onGenerate={handleGenerateBlog}
        onBlogPostAdded={handleBlogPostAdded}
        storeId={storeId}
      />
    </div>
  )
} 
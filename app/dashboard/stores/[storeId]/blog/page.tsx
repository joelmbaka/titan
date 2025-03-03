"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BlogPostModal } from "@/components/blog-post-modal"
import { useParams } from "next/navigation"
import { gql } from "@apollo/client"
import { useApolloClient } from "@apollo/client"
import { BlogPostData } from '@/components/blog-post-modal'

export default function BlogPage() {
  const params = useParams()
  if (!params) throw new Error("Params is null")
  const storeId = params.storeId as string
  const [showBlogModal, setShowBlogModal] = useState(false)
  const client = useApolloClient()
  const [blogPosts, setBlogPosts] = useState<BlogPostData[]>([])

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

  const fetchBlogPosts = async () => {
    console.log('Fetching blog posts...');
    try {
      const { data } = await client.query({
        query: gql`
          query BlogPosts($storeId: ID!) {
            blogPosts(storeId: $storeId) {
              id
              title
              content
              metaDescription
              tags
              category
              status
              createdAt
              updatedAt
            }
          }
        `,
        variables: { storeId },
      });
      console.log('Fetched blog posts:', data.blogPosts);
      setBlogPosts(data.blogPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => setShowBlogModal(true)}>
          Create New Blog Post
        </Button>
      </div>

      <BlogPostModal
        open={showBlogModal}
        onClose={() => setShowBlogModal(false)}
        onGenerate={handleGenerateBlog}
        storeId={storeId}
      />
    </div>
  )
} 
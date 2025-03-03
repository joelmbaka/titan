   // app/dashboard/stores/[storeId]/blog/page.tsx
   "use client";

   import { Button } from "@/components/ui/button";
   import { Plus } from "lucide-react";
   import { useState } from "react";
   import { BlogPostModal } from "@/components/blog-post-modal"; // Ensure this is the correct modal
   import { useParams } from "next/navigation";
   import { BlogPostType } from "@/lib/types"; // Ensure this type is defined correctly
   import { useQuery } from "@apollo/client";
   import { GET_BLOG_POSTS_QUERY } from '@/lib/graphql/queries'; // Updated import
   import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
   import { LoadingSpinner } from "@/components/loading-spinner";
   import Link from 'next/link';
   import { BlogPostData } from '@/components/blog-post-modal';
   import { OperationVariables } from "@apollo/client";

   export default function BlogPage() {
     const [showBlogModal, setShowBlogModal] = useState(false);
     const [blogPost, setBlogPost] = useState<BlogPostData | null>(null);
     const params = useParams();
     if (!params) throw new Error("Params is null");
     const storeId = params.storeId as string;

     const { loading, error, data, refetch } = useQuery(GET_BLOG_POSTS_QUERY, {
       variables: { storeId },
       fetchPolicy: "cache-and-network",
     });

     const blogPosts: BlogPostType[] = data?.blogPosts || [];

     const handleGenerateBlog = async (prompt: string): Promise<BlogPostData> => {
       const response = await fetch('https://titan2-o.onrender.com/generate-blog-post', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           prompt,
           storeId,
           category: "Wellness"
         }),
       });

       if (!response.ok) {
         throw new Error("Failed to generate blog post");
       }

       const data = await response.json();
       return {
         id: data.id || '1',
         title: data.title,
         content: data.content,
         meta_description: data.meta_description,
         tags: data.tags,
         category: data.category,
       };
     };

     const handleBlogPostAdded = async (variables?: Partial<OperationVariables>): Promise<void> => {
       await refetch(variables); // Ensure this matches the expected type
     };

     if (loading) return <LoadingSpinner />;
     if (error) return <div className="p-6 text-red-500">Error loading blog posts: {error.message}</div>;

     return (
       <div className="p-6">
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold">Blog Posts</h1>
           <Button onClick={() => {
             const promptValue = blogPost ? blogPost.content : ''; // Ensure prompt is a string
             handleGenerateBlog(promptValue)
               .then(blogPost => {
                 console.log("Blog post generated successfully:", blogPost);
                 setBlogPost(blogPost);
                 setShowBlogModal(true);
               })
               .catch(err => {
                 console.error("Error generating blog post:", typeof err === 'string' ? err : (err.message || 'Unknown error'));
               });
           }}>
             <Plus className="mr-2 h-4 w-4" /> Generate Blog Post
           </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {blogPosts.map((post) => (
             <Card key={post.id}>
               <CardHeader>
                 <CardTitle>{post.title}</CardTitle>
                 <div className="text-sm text-muted-foreground">
                   {post.category} • {new Date(post.createdAt).toLocaleDateString()}
                 </div>
               </CardHeader>
               <CardContent>
                 <p className="text-sm line-clamp-3">{post.metaDescription}</p>
                 <Link href={`/dashboard/stores/${storeId}/blog/${post.id}`} className="text-blue-600 hover:text-blue-800">
                   Read more
                 </Link>
               </CardContent>
             </Card>
           ))}
         </div>

         <BlogPostModal
           open={showBlogModal}
           onClose={() => setShowBlogModal(false)}
           onGenerate={handleGenerateBlog}
           onBlogPostAdded={handleBlogPostAdded}
           storeId={storeId}
           blogPost={blogPost}
         />
       </div>
     );
   }
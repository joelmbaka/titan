   // app/dashboard/stores/[storeId]/blog/page.tsx
   "use client";

   import { Button } from "@/components/ui/button";
   import { Plus } from "lucide-react";
   import { useState } from "react";
   import { AddProductModal } from "@/components/add-product-modal"; // Ensure this is the correct modal
   import { useParams } from "next/navigation";
   import { BlogPostType } from "@/lib/types"; // Ensure this type is defined correctly
   import { useQuery } from "@apollo/client";
   import { GET_BLOG_POSTS_QUERY } from '@/lib/graphql/queries'; // Updated import
   import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
   import { LoadingSpinner } from "@/components/loading-spinner";
   import Link from 'next/link';

   export default function BlogPage() {
     const [showBlogModal, setShowBlogModal] = useState(false);
     const params = useParams();
     if (!params) throw new Error("Params is null");
     const storeId = params.storeId as string;

     const { loading, error, data, refetch } = useQuery(GET_BLOG_POSTS_QUERY, {
       variables: { storeId },
       fetchPolicy: "cache-and-network",
     });

     const blogPosts: BlogPostType[] = data?.blogPosts || [];

     if (loading) return <LoadingSpinner />;
     if (error) return <div className="p-6 text-red-500">Error loading blog posts: {error.message}</div>;

     return (
       <div className="p-6">
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold">Blog Posts</h1>
           <Button onClick={() => setShowBlogModal(true)}>
             <Plus className="mr-2 h-4 w-4" /> Add Blog Post
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

         <AddProductModal
           open={showBlogModal}
           onClose={() => setShowBlogModal(false)}
           onProductAdded={refetch} // Ensure this prop is correct
           storeId={storeId}
         />
       </div>
     );
   }
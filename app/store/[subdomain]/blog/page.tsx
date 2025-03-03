// app/store/[subdomain]/blog/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getStoreBySubdomain } from '@/lib/storeFunctions';
import { getBlogPostsByStoreId } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ subdomain: string }>; 
}

const StoreBlogPage = ({ params }: PageProps) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const { subdomain } = await params;
        const fetchedStore = await getStoreBySubdomain(subdomain);

        if (!fetchedStore) {
          notFound(); // Handle store not found
          return;
        }

        setStore(fetchedStore);
        const fetchedBlogPosts = await getBlogPostsByStoreId(fetchedStore.id);
        setBlogPosts(fetchedBlogPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [params]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  if (!blogPosts || blogPosts.length === 0) {
    return <div>No blog posts available.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-gray-600">Latest news, guides, and insights</p>
      </div>

      {/* Blog Posts Grid */}
      {blogPosts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="p-6">
            <div className="uppercase tracking-wide text-xs text-blue-600 font-semibold">
              {post.category}
            </div>
            <Link 
              href={`/store/${store?.subdomain}/blog/${post.id}`}
              className="block mt-1 text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {post.title}
            </Link>
            <p className="mt-2 text-gray-600 text-sm">
              {post.metaDescription}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <Link 
                href={`/store/${store?.subdomain}/blog/${post.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Read more
              </Link>
              <span className="text-gray-500 text-xs">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoreBlogPage;
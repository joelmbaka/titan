import { getStoreBySubdomain } from '@/lib/storeFunctions.server';
import { getBlogPostsByStoreId } from '@/lib/storeFunctions';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function StoreBlogPage({ params }: PageProps) {
  try {
    // Await the params promise
    const { subdomain } = await params;
    console.log('StoreBlogPage - Subdomain:', subdomain);

    const store = await getStoreBySubdomain(subdomain);
    console.log('StoreBlogPage - Store data:', store);

    if (!store) {
      console.log('StoreBlogPage - Store not found');
      return notFound();
    }

    // Fetch blog posts from the database
    const blogPosts = await getBlogPostsByStoreId(store.id);
    
    // If no blog posts are found, use mock data for demonstration
    const displayBlogPosts = blogPosts.length > 0 ? blogPosts : [
      {
        id: '1',
        title: 'Getting Started with Our Products',
        metaDescription: 'A beginner\'s guide to using our products effectively',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        category: 'Guides',
        tags: ['beginner', 'guide', 'products'],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Top 5 Features You Should Know About',
        metaDescription: 'Discover the most powerful features of our products',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        category: 'Features',
        tags: ['features', 'tips', 'products'],
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: '3',
        title: 'Customer Success Story: How Company X Increased Sales',
        metaDescription: 'Learn how Company X achieved amazing results with our products',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        category: 'Case Studies',
        tags: ['success', 'case study', 'business'],
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-gray-600">Latest news, guides, and insights</p>
        </div>

        {/* Featured Post */}
        {displayBlogPosts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:flex-shrink-0 bg-gray-100 md:w-64 flex items-center justify-center p-8">
                <div className="text-gray-500">Featured Image</div>
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">
                  {displayBlogPosts[0].category}
                </div>
                <Link 
                  href={`/store/${subdomain}/blog/${displayBlogPosts[0].id}`}
                  className="block mt-1 text-2xl font-semibold text-gray-900 hover:text-blue-600"
                >
                  {displayBlogPosts[0].title}
                </Link>
                <p className="mt-2 text-gray-600">
                  {displayBlogPosts[0].metaDescription}
                </p>
                <div className="mt-4">
                  <Link 
                    href={`/store/${subdomain}/blog/${displayBlogPosts[0].id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBlogPosts.slice(1).map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-100 h-40 flex items-center justify-center">
                <div className="text-gray-500">Post Image</div>
              </div>
              <div className="p-6">
                <div className="uppercase tracking-wide text-xs text-blue-600 font-semibold">
                  {post.category}
                </div>
                <Link 
                  href={`/store/${subdomain}/blog/${post.id}`}
                  className="block mt-1 text-lg font-semibold text-gray-900 hover:text-blue-600"
                >
                  {post.title}
                </Link>
                <p className="mt-2 text-gray-600 text-sm">
                  {post.metaDescription}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <Link 
                    href={`/store/${subdomain}/blog/${post.id}`}
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
      </div>
    );
  } catch (error) {
    console.error('StoreBlogPage - Error:', error);
    throw error;
  }
} 
// app/test/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getBlogPostsByStoreId } from '@/lib/storeFunctions';

const TestPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const storeId = '894178a0-4c3b-4550-abcb-f3af2628da5f'; // Specific store ID for testing

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getBlogPostsByStoreId(storeId);
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      }
    };

    fetchBlogPosts();
  }, []);

  return (
    <div>
      <h1 className='text-3xl font-bold mb-4'>Test Blog Posts</h1>
      {blogPosts.length === 0 ? (
        <p>No blog posts available.</p>
      ) : (
        <ul>
          {blogPosts.map(post => (
            <li key={post.id} className='mb-2'>
              <h2 className='font-semibold'>{post.title}</h2>
              <p>{post.metaDescription}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TestPage;
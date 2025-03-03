import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_BLOG_POST_QUERY } from '@/lib/graphql/queries';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function BlogPostPage() {
  const router = useRouter();
  const { id } = router.query;

  const { loading, error, data } = useQuery(GET_BLOG_POST_QUERY, {
    variables: { id },
    skip: !id,
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading blog post: {error.message}</div>;

  const post = data.blogPost;

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold'>{post.title}</h1>
      <p className='text-gray-700'>{post.content}</p>
    </div>
  );
} 
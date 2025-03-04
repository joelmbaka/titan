import { signIn } from 'next-auth/react';

export default function SignInPage() {
  console.log('SignInPage rendered');

  const handleSignIn = (provider: string) => {
    console.log(`Sign in with ${provider} clicked`);
    signIn(provider);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Sign In</h1>
      <div className="space-y-4">
        <button 
          onClick={() => handleSignIn('google')} 
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Sign in with Google
        </button>
        <button 
          onClick={() => handleSignIn('twitter')} 
          className="w-full py-2 px-4 bg-blue-400 text-white rounded hover:bg-blue-500 transition"
        >
          Sign in with X
        </button>
        <button 
          onClick={() => handleSignIn('linkedin')} 
          className="w-full py-2 px-4 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
        >
          Sign in with LinkedIn
        </button>
        <button 
          onClick={() => handleSignIn('facebook')} 
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign in with Facebook
        </button>
        <button 
          onClick={() => handleSignIn('instagram')} 
          className="w-full py-2 px-4 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
        >
          Sign in with Instagram
        </button>
        <button 
          onClick={() => handleSignIn('medium')} 
          className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          Sign in with Medium
        </button>
      </div>
    </div>
  );
} 
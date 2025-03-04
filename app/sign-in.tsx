import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const handleSignIn = (provider: string) => {
    console.log(`Sign in with ${provider} clicked`);
    signIn(provider); // Now ready to test sign-in
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Sign In Page</h1>
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
          onClick={() => handleSignIn('github')} 
          className="w-full py-2 px-4 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
} 
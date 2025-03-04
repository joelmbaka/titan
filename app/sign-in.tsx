import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => signIn('google')}>Sign in with Google</button>
      <button onClick={() => signIn('twitter')}>Sign in with X</button>
      <button onClick={() => signIn('linkedin')}>Sign in with LinkedIn</button>
      <button onClick={() => signIn('facebook')}>Sign in with Facebook</button>
      <button onClick={() => signIn('instagram')}>Sign in with Instagram</button>
      <button onClick={() => signIn('medium')}>Sign in with Medium</button>
    </div>
  );
} 
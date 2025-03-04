import Link from 'next/link';

export default function Header() {
  console.log('Header component rendered');

  const handleSignInClick = () => {
    console.log('Sign In button clicked');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-xl">Your App Name</h1>
      <Link href="/sign-in">
        <button onClick={handleSignInClick} className="py-2 px-4 bg-blue-500 rounded hover:bg-blue-600 transition">
          Sign In
        </button>
      </Link>
    </header>
  );
} 
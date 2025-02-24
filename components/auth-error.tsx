'use client';

export default function AuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-red-500">
        Authentication Error
      </h1>
      <p className="mt-2 text-muted-foreground">
        There was a problem authenticating your session. Please try again.
      </p>
    </div>
  );
} 
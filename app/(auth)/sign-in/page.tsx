'use client';

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { handleGitHubSignIn, userSignOut } from '@/lib/actions';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SignInPage(props: any) {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/'; // Default to '/' if not provided
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        // Your click handling logic here
    };

    const handleSignOut = () => {
        userSignOut()
            .then(() => {
                // Optionally redirect or update UI after sign-out
            })
            .catch((error) => {
                console.error('Error during sign-out:', error);
            });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4">
            <h1 className="text-4xl font-bold mb-6">Sign In</h1>
            <div className="space-y-4">
                <button onClick={() => signIn('google')} className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                    Sign in with Google
                </button>
                <button onClick={() => signIn('twitter')} className="w-full py-2 px-4 bg-blue-400 text-white rounded hover:bg-blue-500 transition">
                    Sign in with X
                </button>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    setLoading(true);
                    handleGitHubSignIn(callbackUrl)
                        .then(() => {
                            // Handle successful sign-in if needed
                        })
                        .catch((error) => {
                            console.error('Error during sign-in:', error);
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                }}>
                    <Button type="submit" disabled={loading}>Sign In with GitHub</Button>
                </form>
                <button onClick={handleSignOut}>Sign Out</button>
            </div>
        </div>
    );
}

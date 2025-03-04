import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function SignInPage(props: any) {
    const session = await auth();
    let callbackUrl = "/dashboard";
    const searchParams = props.searchParams || {};
    if (typeof searchParams.callbackUrl === 'string') {
        callbackUrl = searchParams.callbackUrl;
    }

    if (session) {
        console.log("Sign-in page session:", {
            hasUser: !!session.user,
            userId: session.user?.id || 'missing',
            hasAccessToken: !!session.accessToken,
            tokenPrefix: session.accessToken ? session.accessToken.substring(0, 5) + '...' : 'missing'
        });
        redirect(callbackUrl);
    }

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
                <form action={async () => {
                    "use server";
                    await signIn("github", { 
                        redirectTo: callbackUrl,
                        scope: "user:email repo" 
                    });
                }}>
                    <Button type="submit">Sign In with GitHub</Button>
                </form>
            </div>
        </div>
    );
} 
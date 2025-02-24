import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function SignIn(props: any) {
    const session = await auth();
    
    // Get the callback URL safely
    let callbackUrl = "/dashboard";
    
    // Access searchParams safely
    const searchParams = props.searchParams || {};
    if (typeof searchParams.callbackUrl === 'string') {
        callbackUrl = searchParams.callbackUrl;
    }

    // Redirect authenticated users to the callback URL or dashboard
    if (session) {
        // Add a console log to check if session has the necessary properties
        console.log("Sign-in page session:", {
            hasUser: !!session.user,
            userId: session.user?.id || 'missing',
            hasAccessToken: !!session.accessToken,
            tokenPrefix: session.accessToken ? session.accessToken.substring(0, 5) + '...' : 'missing'
        });
        
        redirect(callbackUrl);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <form
                action={async () => {
                    "use server";
                    await signIn("github", { 
                        redirectTo: callbackUrl,
                        // Request additional scopes if needed
                        // These will be merged with those from auth.ts
                        scope: "user:email repo" 
                    });
                }}
            >
                <Button type="submit">Sign In with GitHub</Button>
            </form>
        </div>
    );
}

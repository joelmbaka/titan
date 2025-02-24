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
        redirect(callbackUrl);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <form
                action={async () => {
                    "use server";
                    await signIn("github", { redirectTo: callbackUrl });
                }}
            >
                <Button type="submit">Sign In with GitHub</Button>
            </form>
        </div>
    );
}

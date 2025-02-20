import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function SignIn() {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <form
                action={async () => {
                    "use server"
                    await signIn("github", { redirect: true, callbackUrl: "/profile" });
                }}
            >
                <Button type="submit">Sign In with GitHub</Button>
            </form>
        </div>
    );
}

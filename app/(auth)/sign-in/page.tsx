import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignIn() {
    const session = await auth();

    // Redirect authenticated users to the profile page
    if (session) {
        redirect("/profile");
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <form
                action={async () => {
                    "use server"
                    await signIn("github", { redirectTo: "/profile" });
                }}
            >
                <Button type="submit">Sign In with GitHub</Button>
            </form>
        </div>
    );
}

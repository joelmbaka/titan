import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p className="text-muted-foreground">
        You are signed in as {session?.user?.email}.
      </p>
      
    </div>
  );
}

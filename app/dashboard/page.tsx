import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {session.user.name || session.user.email}!</p>
      <p>You are now signed in.</p>
    </div>
  );
}

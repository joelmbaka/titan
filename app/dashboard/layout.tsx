import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Providers } from "@/lib/providers";
import { StoreProvider } from "@/context/store-context";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <StoreProvider>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 pl-[250px]">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </StoreProvider>
    </Providers>
  );
} 
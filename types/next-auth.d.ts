import "next-auth";

declare module "next-auth" {
  interface User {
    accessToken?: string;
    id: string;
  }
  
  interface Session {
    user: User;
    accessToken?: string;
  }
} 
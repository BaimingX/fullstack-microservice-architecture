import "next-auth";

declare module "next-auth" {
  interface Session {
    backendToken: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
  
  interface User {
    id: string;
    name?: string | null;
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    backendToken: string;
  }
} 
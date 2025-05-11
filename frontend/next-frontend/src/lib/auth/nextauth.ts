import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import serverAxios from "@/lib/axios-server";

// Extend Session type to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
    backendToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Call your backend login API
          const response = await serverAxios.post('/coolStuffUser/login', {
            email: credentials?.email,
            password: credentials?.password,
          });
          
          // Process the response
          const responseData = response.data?.code ? response.data : response;
          if (responseData.code === "200" && responseData.data) {
            const userData = responseData.data;
            // Return user object to NextAuth
            return {
              id: userData.id.toString(),
              name: userData.email,
              email: userData.email,
              token: userData.token, // Store backend token
              // Add any other user information you need
            };
          }
          // If login fails
          throw new Error(responseData.msg || "Invalid credentials");
        } catch (error: any) {
          console.error("Login failed:", error);
          throw new Error(error?.message || "Authentication failed");
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // On first login, user contains data from the authorize function
      if (user) {
        token.userId = user.id;
        
        // 保存用户头像URL
        if (user.image) {
          token.picture = user.image;
        }
        
        // For credential login, use backend token
        if (account?.provider === "credentials" && 'token' in user) {
          token.backendToken = user.token || '';
        } 
        // For Google login, you might need to handle token differently
        else if (account?.provider === "google") {
          // You might need to call your backend to register/login the Google user
          // and get a backend token if your API requires it
          try {
            const response = await serverAxios.post('/coolStuffUser/oauth/google', {
              name: user.name,
              email: user.email,
              googleId: user.id,
              image: user.image,
            });
            
            const responseData = response.data?.code ? response.data : response;
            if (responseData.code === "200" && responseData.data) {
              token.backendToken = responseData.data.token;
              token.userId = responseData.data.id.toString();
              // 确保返回的用户数据中的头像URL也被保存
              if (responseData.data.image) {
                token.picture = responseData.data.image;
              }
            }
          } catch (error) {
            console.error("Google OAuth backend sync failed:", error);
            // Continue even if backend sync fails - user is still authenticated with Google
          }
        }
      }
      return token;
    },
    
    async session({ session, token }: { session: any; token: any }) {
      // Add custom data to client session
      if (session.user) {
        session.user.id = token.userId || '';
        // 确保图像URL被保留
        if (token.picture) {
          session.user.image = token.picture;
        }
      }
      session.backendToken = token.backendToken || '';
      
      return session;
    }
  },
  
  // Custom pages
  pages: {
    // Remove custom login page config to use NextAuth default login flow
    // signIn: '/login',
    // error: '/login', // Error page
  },
  
  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 30 days
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};

// Use this in your API route
export default NextAuth(authOptions); 
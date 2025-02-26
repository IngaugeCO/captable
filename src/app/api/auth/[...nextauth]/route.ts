import NextAuth from "next-auth";

import { authOptions } from "@/server/auth";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const authHandler = NextAuth({
  ...authOptions,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("[NextAuth] Sign in attempt:", { 
        provider: account?.provider,
        userId: user?.id,
        email: user?.email,
        hasCredentials: !!credentials
      });
      
      // Your existing signIn logic
      return true; // or your existing return value
    },
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] Redirect:", { url, baseUrl });
      // Your existing redirect logic
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, user, token }) {
      console.log("[NextAuth] Session callback:", { 
        hasUser: !!user,
        hasToken: !!token,
        sessionUserId: session?.user?.id
      });
      
      // Your existing session logic
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log("[NextAuth] JWT callback:", { 
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile
      });
      
      // Your existing JWT logic
      return token;
    },
  },
  events: {
    async signIn(message) {
      console.log("[NextAuth] Event - Sign in successful:", { 
        provider: message.account?.provider,
        userId: message.user.id
      });
    },
    async signOut(message) {
      console.log("[NextAuth] Event - Sign out:", { 
        sessionUserId: message.session?.user?.id 
      });
    },
    async createUser(message) {
      console.log("[NextAuth] Event - User created:", { 
        userId: message.user.id 
      });
    },
    async linkAccount(message) {
      console.log("[NextAuth] Event - Account linked:", { 
        provider: message.account.provider,
        userId: message.user.id
      });
    },
  },
});

// Add a global error handler for NextAuth
console.error = (...args) => {
  console.log("[NextAuth] Error:", ...args);
  return console.error(...args);
};

export { authHandler as GET, authHandler as POST };

import NextAuth from "next-auth";
import { type User as NextAuthUser } from "next-auth";
import { type MemberStatusEnum } from "@/prisma/enums";

import { authOptions } from "@/server/auth";

// Extend the NextAuth User type to include our custom properties
interface ExtendedUser extends NextAuthUser {
  companyId?: string;
  memberId?: string;
  isOnboarded?: boolean;
  companyPublicId?: string;
  status?: MemberStatusEnum | "";
}

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
      
      if (token) {
        session.user.id = token.id;
        session.user.companyId = token.companyId;
        session.user.memberId = token.memberId;
        session.user.isOnboarded = token.isOnboarded;
        session.user.companyPublicId = token.companyPublicId;
        session.user.status = token.status;
      }
      
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log("[NextAuth] JWT callback:", { 
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile
      });
      
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.id = user.id;
        token.companyId = extendedUser.companyId || "";
        token.memberId = extendedUser.memberId || "";
        token.isOnboarded = extendedUser.isOnboarded || false;
        token.companyPublicId = extendedUser.companyPublicId || "";
        token.status = extendedUser.status || "";
      }
      
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

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

type UserRole = "ADMIN" | "RECRUITER" | "INTERVIEWER";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role as UserRole;
        token.organizationId = (user as any).organizationId as string;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

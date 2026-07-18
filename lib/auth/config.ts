import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations/auth.schema";
import type { Role } from "@prisma/client";
import { authConfig } from "@/lib/auth/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { organization: true },
        });

        if (!user || !user.hashedPassword) return null;
        if (!user.isActive || user.deletedAt) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }

      // Sync role from DB on subsequent requests
      if (token.sub && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, organizationId: true, isActive: true, deletedAt: true },
        });
        if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
          token.role = dbUser.role;
          token.organizationId = dbUser.organizationId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!;
        session.user.role = token.role as Role;
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const orgSlug = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
          const org = await prisma.organization.create({
            data: {
              name: user.name ?? "My Organization",
              slug: `${orgSlug}-${Date.now()}`,
            },
          });

          await prisma.user.create({
            data: {
              name: user.name ?? "",
              email: user.email,
              image: user.image,
              organizationId: org.id,
              role: "ADMIN",
            },
          });
        }
      }
      return true;
    },
  },
});

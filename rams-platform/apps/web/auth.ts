import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as argon2 from "argon2";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? "msrit.edu";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const domain = email.split("@")[1];
        if (domain !== ALLOWED_DOMAIN) {
          throw new Error(`Only @${ALLOWED_DOMAIN} emails are allowed.`);
        }

        const ip = "login";
        const allowed = await checkRateLimit(ip);
        if (!allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("Invalid credentials.");

        const isValid = await argon2.verify(
          user.passwordHash,
          credentials.password as string
        );
        if (!isValid) throw new Error("Invalid credentials.");

        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: "USER_LOGIN",
            entityType: "User",
            entityId: user.id,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

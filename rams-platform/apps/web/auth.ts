import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as argon2 from "argon2";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Role } from "@/lib/rbac";
import { authConfig } from "./auth.config";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? "msrit.edu";

// NOTE: we deliberately do NOT augment "next-auth/jwt" here. With
// moduleResolution: "bundler" (required by Next.js 15), TypeScript's
// ambient module augmentation can fail to resolve that subpath export
// (TS2664), even though the module exists at runtime. Casting token.role
// at the call sites in auth.config.ts's callbacks is a smaller, more
// portable fix than switching the whole project's module resolution
// strategy.
//
// This file is the FULL auth config (real CredentialsProvider using argon2 +
// Prisma) and must only be imported from Node-runtime code (server
// components, server actions, the NextAuth API route) - never from
// middleware.ts, which runs in the Edge Runtime and can't load argon2's
// native addon. middleware.ts imports the separate, provider-less
// `authConfig` from auth.config.ts instead. See auth.config.ts for details.

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
          role: user.role as Role,
        };
      },
    }),
  ],
});

import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/rbac";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }
  interface User {
    role: Role;
  }
}

/**
 * Edge Runtime-safe auth config. Middleware runs in the Edge Runtime, which
 * cannot load native Node addons (argon2) or Prisma's Node-only engine -
 * `serverExternalPackages` in next.config.ts does NOT cover the Edge Runtime,
 * only the regular Node server. So this config deliberately has an empty
 * `providers` array and no argon2/Prisma imports; it's only used to read/
 * validate the JWT session in middleware, never to actually authenticate.
 *
 * The full config (with the real CredentialsProvider, argon2, and Prisma)
 * lives in auth.ts, which spreads this config and adds providers - that
 * version is used everywhere except middleware.ts.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

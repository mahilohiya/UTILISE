import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Rate limiting for login to prevent brute force attacks
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email as string;

                // Domain restriction
                if (!email.endsWith("@msrit.edu")) {
                    throw new Error("Only @msrit.edu emails are allowed.");
                }

                // Rate limiting check based on IP (mocked here as "global" for simplicity)
                const ip = req.headers?.get("x-forwarded-for") ?? "127.0.0.1";
                const { success } = await ratelimit.limit(`login_attempt_${ip}`);
                if (!success) {
                    throw new Error("Too many login attempts. Please try again later.");
                }

                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) throw new Error("Invalid credentials.");

                const isValid = await argon2.verify(user.passwordHash, credentials.password as string);
                if (!isValid) throw new Error("Invalid credentials.");

                // Audit log the login
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

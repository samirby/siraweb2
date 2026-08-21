import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db/prisma";
import {
  canAttemptLogin,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/security/login-rate-limit";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) {
          return null;
        }

        const loginLimit = canAttemptLogin(email);

        if (!loginLimit.allowed) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            role: true,
          },
        });

        if (!user || user.status !== "ACTIVE") {
          recordLoginFailure(email);
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          recordLoginFailure(email);
          return null;
        }

        resetLoginFailures(email);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});

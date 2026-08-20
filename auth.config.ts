import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = Boolean(auth?.user);
      const isAdmin = nextUrl.pathname.startsWith("/admin");
      const isLogin = nextUrl.pathname === "/admin/login";

      if (isLogin) {
        if (loggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }

        return true;
      }

      if (isAdmin) {
        return loggedIn;
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;

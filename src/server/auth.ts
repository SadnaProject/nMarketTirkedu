import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  type DefaultUser,
  User,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "server/db";
import { env } from "env.mjs";
import Credentials from "next-auth/providers/credentials";
import { appRouter } from "./service/root";
import zConvert from "./helpers/zConvert";
import { TRPCError } from "@trpc/server";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      type: "guest" | "member";
      name?: string;
      email?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    // ...other properties
    type: "guest" | "member";
    name?: string;
    email?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    type: "guest" | "member";
    name?: string;
    email?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "anon",
      credentials: {},
      async authorize() {
        const caller = appRouter.createCaller({ session: null });
        const userId = await zConvert(() => caller.auth.startSession());
        return { id: userId, type: "guest" };
        //no need to check anything here, just create a new CT anonymous session and return the token
        // return {};
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: { label: "Password", type: "password" },
        session: { label: "Session", type: "text" },
      },
      authorize: async (credentials) => {
        const caller = appRouter.createCaller({ session: null });
        if (!credentials)
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credentials are required",
          });
        const userId = await zConvert(() =>
          caller.users.loginMember(credentials)
        );
        return { id: userId, email: credentials.email, type: "member" };

        // const result = await prisma.user.findFirst({
        //   where: { email },
        // });
        // if (!result) throw new Error("User not found");

        // const isValidPassword = result.password === password;
        // if (!isValidPassword) throw new Error("Invalid password");

        // return { id: result.id, email, username: result.username };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.userId;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  jwt: {
    maxAge: 15 * 24 * 30 * 60, // 15 days
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @param ctx - The context object from `getServerSideProps`.
 * @param ctx.req - The request object.
 * @param ctx.res - The response object.
 * @returns The session object.
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  type DefaultUser,
  User,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "server/db";
import { env } from "env.mjs";
import Credentials from "next-auth/providers/credentials";
import { appRouter } from "./service/root";
import zConvert from "./helpers/zConvert";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { service } from "./service/_service";

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
      name: "anonymous",
      id: "anonymous",
      credentials: { id: { label: "Id", type: "id" } },
      authorize(credentials) {
        // const caller = appRouter.createCaller({ session: null });
        // const userId = await zConvert(
        //   () => new Promise<string>((resolve) => resolve(facade.startSession()))
        // );
        // return { id: userId, type: "guest" };
        if (!credentials)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Credentials are required",
          });
        return { id: credentials.id, type: "guest" };
      },
    }),
    Credentials({
      name: "credentials",
      id: "credentials",
      credentials: {
        id: { label: "Id", type: "id" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        session: { label: "Session", type: "json" },
      },
      authorize: async (credentials) => {
        if (!credentials)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Credentials are required",
          });

        const session = await zConvert(() =>
          z
            .object({
              expires: z.string(),
              user: z.object({ id: z.string(), type: z.enum(["guest"]) }),
            })
            .parseAsync(JSON.parse(credentials.session))
        );

        return {
          id: credentials.id,
          email: credentials.email,
          type: "member",
        };

        // const userId = await zConvert(
        //   () =>
        //     new Promise<string>((resolve) =>
        //       resolve(
        //         facade.loginMember(
        //           session.user.id,
        //           credentials.email,
        //           credentials.password
        //         )
        //       )
        //     )
        // );
        // return { id: userId, email: credentials.email, type: "member" };
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
        token.type = user.type;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.userId;
        session.user.type = token.type;
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
  adapter: PrismaAdapter(db),
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

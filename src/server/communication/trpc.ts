/* eslint-disable jsdoc/require-param-description */
/* eslint-disable jsdoc/require-returns */
/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT.
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
// import { getServerAuthSession } from "server/auth";
import type ws from "ws";

type CreateContextOptions = {
  session: Session | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res.
 *
 * @param opts
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 * @example
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    // prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @param opts
 * @see https://trpc.io/docs/context
 * @example
 */
export const createTRPCContext = async (
  opts:
    | CreateNextContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
) => {
  const session = await getSession(opts);
  return createInnerTRPCContext({
    session,
  });

  //? This is the original code
  // const { req, res } = opts;
  // Get the session from the server using the getServerSession wrapper function
  // const session = await getServerAuthSession({ req, res });
  // return createInnerTRPCContext({
  //   session,
  // });
};

/**
 * 2. INITIALIZATION.
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { type NodeHTTPCreateContextFnOptions } from "@trpc/server/dist/adapters/node-http";
import { type IncomingMessage } from "http";
import { getSession } from "next-auth/react";
import { Prisma } from "@prisma/client";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.cause instanceof ZodError) {
      return {
        ...shape,
        message: error.cause.errors[0]?.message ?? error.message,
        data: {
          ...shape.data,
          zodError: error.cause.flatten(),
        },
      };
    }
    if (
      error.cause instanceof Prisma.PrismaClientKnownRequestError ||
      error.cause instanceof Prisma.PrismaClientUnknownRequestError ||
      error.cause instanceof Prisma.PrismaClientRustPanicError ||
      error.cause instanceof Prisma.PrismaClientInitializationError ||
      error.cause instanceof Prisma.PrismaClientValidationError
    ) {
      return {
        ...shape,
        message: "Something went wrong",
      };
    }
    return shape;
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT).
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/service/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure.
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceValidSession = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authenticated) procedure.
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const validSessionProcedure = t.procedure.use(enforceValidSession);

const enforceLoggedIn = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || ctx.session.user.type !== "member") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
export const loggedInProcedure = t.procedure.use(enforceLoggedIn);

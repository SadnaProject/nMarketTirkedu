import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const tweetRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return prisma.tweet.findMany();
  }),

  count: publicProcedure.query(() => {
    return prisma.tweet.count();
  }),

  create: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, "Tweet must be at least 1 character")
          .max(280, "Tweet must be at most 280 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return prisma.tweet.create({
        data: {
          content: input.content,
          authorId: ctx.session.user.id,
        },
      });
    }),
});

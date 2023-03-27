import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  hello: publicProcedure.input(z.string()).query(({ input }) => {
    return `Hello ${input}`;
  }),

  getSecretMessage: protectedProcedure.query(({ ctx }) => {
    const decoration = new StringFactory().getSecretMessageDecoration();
    return `Your username is ${ctx.session.user.username}${decoration}`;
  }),
});

export class StringFactory {
  private secretMessageDecoration: string;

  constructor() {
    this.secretMessageDecoration = "";
  }

  public getSecretMessageDecoration() {
    return this.secretMessageDecoration;
  }
}

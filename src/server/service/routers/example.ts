import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authedProcedure,
} from "server/service/trpc";
import { observable } from "@trpc/server/observable";

// export const createStoreSchema = z.object({ text: z.string(), price:z.number() });

// type CreateStore = z.infer<typeof createStoreSchema>;

// function createStore(input:CreateStore){

// }

export const exampleRouter = createTRPCRouter({
  // {
  //   text: "hi"
  // }
  hello: publicProcedure
    .input(z.object({ text: z.string(), price: z.number() }))
    .query(({ input }) => {
      const { text, price } = input;
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: authedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  createStore: authedProcedure.mutation(() => {
    // create on db
    return "created store";
  }),

  randomNumber: publicProcedure.subscription(() => {
    return observable<number>((emit) => {
      const int = setInterval(() => {
        emit.next(Math.random());
      }, 500);
      return () => {
        clearInterval(int);
      };
    });
  }),
});

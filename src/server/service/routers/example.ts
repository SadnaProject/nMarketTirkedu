import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  validSessionProcedure,
} from "server/service/trpc";
import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";

// export const createStoreSchema = z.object({ text: z.string(), price:z.number() });

// type CreateStore = z.infer<typeof createStoreSchema>;

// function createStore(input:CreateStore){

// }

const eventEmitter = new EventEmitter();

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

  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),

  // getSecretMessage: validSessionProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),

  // createStore: validSessionProcedure.mutation(() => {
  //   // create on db
  //   return "created store";
  // }),

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

  onStorePurchase: publicProcedure
    .input(z.object({ storeId: z.string() }))
    // the function gets store id as input
    .subscription(({ input }) => {
      // we return an observable that emits a string on every purchase
      return observable<string>((emit) => {
        // the following function will be called on every purchase in the store
        const onStorePurchase = (purchaseId: string) => {
          emit.next(purchaseId);
        };
        // we listen to the event emitter for the store id
        eventEmitter.on(`purchase store ${input.storeId}`, onStorePurchase);
        // when the observable is unsubscribed, we remove the listener
        return () => {
          eventEmitter.off(`purchase store ${input.storeId}`, onStorePurchase);
        };
        // in the purchase function, we will call eventEmitter.emit(`purchase store ${storeId}`, purchaseId)
        // (I need to add dependency injection for eventEmitter through HasEventEmitter class)
      });
    }),

  authorize: publicProcedure
    .input(
      z.undefined().or(
        z.object({
          email: z.string().email("Invalid email"),
          password: z.string().min(8, "Password must be at least 8 characters"),
        })
      )
    )
    .mutation(({ input }) => {
      if (!input) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Credentials are required",
        });
      }
      const id = randomUUID();
      return { id, email: input.email, name: input.email };
    }),
});

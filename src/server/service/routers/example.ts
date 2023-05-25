import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  validSessionProcedure,
} from "server/service/trpc";
import { observable } from "@trpc/server/observable";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { eventEmitter } from "server/EventEmitter";

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

  onStorePurchase: publicProcedure.subscription(() => {
    return observable<unknown>((emit) => {
      eventEmitter.subscribeToEmitter(`userId`, (msg) => {
        emit.next(msg);
      });
      return () => {
        eventEmitter.unsubscribeFromEmitter(`userId`);
      };
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

  notifyAll: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(({ input }) => {
      // eventEmitter.emit("notifyAll", input.message);
      return "ok";
    }),

  onNotifyAll: publicProcedure.input(z.undefined()).subscription(() => {
    return observable<string>((emit) => {
      const onNotifyAll = (message: string) => {
        emit.next(message);
      };
      // eventEmitter.on(`notifyAll`, onNotifyAll);
      return () => {
        // eventEmitter.off(`notifyAll`, onNotifyAll);
      };
    });
  }),

  addNotificationEvent: publicProcedure.mutation(() => {
    // eventEmitter.emit(`addNotificationEvent`);
  }),

  onAddNotificationEvent: publicProcedure.subscription(() => {
    return observable<string>((emit) => {
      const onAddNotificationEvent = (message: string) => {
        emit.next(message);
      };
      // eventEmitter.on(`addNotificationEvent`, onAddNotificationEvent);
      return () => {
        // eventEmitter.off(`addNotificationEvent`, onAddNotificationEvent);
      };
    });
  }),
});

import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authedProcedure,
} from "server/service/trpc";
import { MarketFacade } from "server/domain/MarketFacade";

const facade = new MarketFacade();

export const AuthRouter = createTRPCRouter({
  startSession: publicProcedure.mutation(() => {
    return facade.startSession();
  }),
  loginMember: authedProcedure
    .input(
      z.object({ userId: z.string(), email: z.string(), password: z.string() })
    )
    .query(({ input }) => {
      const { userId, email, password } = input;
      return facade.loginMember(userId, email, password);
    }),
  disconnectUser: authedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const { userId } = input;
      return facade.disconnectUser(userId);
    }),
  logoutMember: authedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const { userId } = input;
      return facade.logoutMember(userId);
    }),
  registerMember: authedProcedure
    .input(
      z.object({ userId: z.string(), email: z.string(), password: z.string() })
    )
    .mutation(({ input }) => {
      const { userId, email, password } = input;
      return facade.registerMember(userId, email, password);
    }),
  removeMember: authedProcedure
    .input(
      z.object({ userIdOfActor: z.string(), memberIdToRemove: z.string() })
    )
    .mutation(({ input }) => {
      const { userIdOfActor, memberIdToRemove } = input;
      return facade.removeMember(userIdOfActor, memberIdToRemove);
    }),
  changeEmail: authedProcedure
    .input(z.object({ userId: z.string(), newEmail: z.string() }))
    .mutation(({ input }) => {
      const { userId, newEmail } = input;
      return facade.changeEmail(userId, newEmail);
    }),
  changePassword: authedProcedure
    .input(
      z.object({
        userId: z.string(),
        oldPassword: z.string(),
        newPassword: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, oldPassword, newPassword } = input;
      return facade.changePassword(userId, oldPassword, newPassword);
    }),
  isGuest: authedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const { userId } = input;
      return facade.isGuest(userId);
    }),
  isMember: authedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const { userId } = input;
      return facade.isMember(userId);
    }),
  isConnected: authedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const { userId } = input;
      return facade.isConnected(userId);
    }),
});

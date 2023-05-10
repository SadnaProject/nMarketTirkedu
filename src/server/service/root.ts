import { AuthRouter } from "./routers/AuthRouter";
import { JobsRouter } from "./routers/JobsRouter";
import { PurchasesHistoryRouter } from "./routers/PurchaseHistoryRouter";
import { StoresRouter } from "./routers/StoresRouter";
import { UsersRouter } from "./routers/UsersRouter";
import { exampleRouter } from "./routers/example";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  auth: AuthRouter,
  jobs: JobsRouter,
  purchaseHistory: PurchasesHistoryRouter,
  stores: StoresRouter,
  users: UsersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

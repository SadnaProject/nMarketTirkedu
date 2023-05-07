import { z } from "zod";
import { createTRPCRouter, authedProcedure } from "server/service/trpc";

import { MarketFacade } from "server/domain/MarketFacade";

const facade = new MarketFacade();
export const PurchasesHistoryRouter = createTRPCRouter({
  reviewStore: authedProcedure
    .input(
      z.object({
        userId: z.string(),
        purchaseId: z.string(),
        storeId: z.string(),
        review: z.number(),
      })
    )
    .mutation(({ input }) => {
      const { userId, purchaseId, storeId, review } = input;
      return facade.reviewStore(userId, purchaseId, storeId, review);
    }),
  reviewProduct: authedProcedure
    .input(
      z.object({
        userId: z.string(),
        purchaseId: z.string(),
        productId: z.string(),
        review: z.number(),
        reviewTitle: z.string(),
        reviewBody: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, purchaseId, productId, review, reviewTitle, reviewBody } =
        input;
      return facade.reviewProduct(
        userId,
        purchaseId,
        productId,
        review,
        reviewTitle,
        reviewBody
      );
    }),
  getStoreRating: authedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return facade.getStoreRating(storeId);
    }),
});

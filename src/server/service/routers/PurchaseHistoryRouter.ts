import { z } from "zod";
import { createTRPCRouter, validSessionProcedure } from "server/service/trpc";
import { facade } from "../_facade";

export const PurchasesHistoryRouter = createTRPCRouter({
  reviewStore: validSessionProcedure
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
  reviewProduct: validSessionProcedure
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
  getStoreRating: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return facade.getStoreRating(storeId);
    }),
});

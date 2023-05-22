import { z } from "zod";
import { createTRPCRouter, validSessionProcedure } from "server/service/trpc";
import { facade } from "../_facade";

export const PurchasesHistoryRouter = createTRPCRouter({
  reviewStore: validSessionProcedure
    .input(
      z.object({
        purchaseId: z.string(),
        storeId: z.string(),
        review: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { purchaseId, storeId, review } = input;
      return facade.reviewStore(
        ctx.session.user.id,
        purchaseId,
        storeId,
        review
      );
    }),
  reviewProduct: validSessionProcedure
    .input(
      z.object({
        purchaseId: z.string(),
        productId: z.string(),
        review: z.number(),
        reviewTitle: z.string(),
        reviewBody: z.string(),
        storeId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const {
        purchaseId,
        productId,
        review,
        reviewTitle,
        reviewBody,
        storeId,
      } = input;
      return facade.reviewProduct(
        ctx.session.user.id,
        purchaseId,
        productId,
        review,
        reviewTitle,
        reviewBody,
        storeId
      );
    }),
  getStoreRating: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return facade.getStoreRating(storeId);
    }),
});

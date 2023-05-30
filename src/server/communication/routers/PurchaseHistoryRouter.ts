import { z } from "zod";
import {
  createTRPCRouter,
  validSessionProcedure,
} from "server/communication/trpc";
import { service } from "../helpers/_service";

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
      return service.reviewStore(
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
      return service.reviewProduct(
        /**TODO: Change facade to service
      const { purchaseId, productId, review, reviewTitle, reviewBody } = input;
      return service.reviewProduct(
*/
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
      return service.getStoreRating(storeId);
    }),

  getMyPurchases: validSessionProcedure.query(({ ctx }) => {
    return service.getMyPurchaseHistory(ctx.session.user.id);
  }),
});

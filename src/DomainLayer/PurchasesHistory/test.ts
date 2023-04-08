import { describe, expect, it } from "vitest";
import { PurchasesHistoryController } from "./PurchasesHistoryController";
import { ProductReviewArgs, ProductReview } from "./ProductReview";

describe("add product purchase review", () => {
    it("should add review to product purchase",  () => {
        const purchaseController = new PurchasesHistoryController();
        const userId = "userId";
        const storeId = "storeId";
        const purchaseId = "purchaseId";
        const productId = "productId";
        const review : ProductReviewArgs = {
            title: "title",
            description: "description",
            rating: 5
        };
        purchaseController.addProductPurchaseReview(
        userId,
        storeId,
        purchaseId,
        productId,
        review
        );
        expect(purchaseController.getPurchase(purchaseId).storeIdToBasketPurchases.get(storeId)?.Products.get(productId)?.Review).toEqual(new ProductReview(review));
    });
});



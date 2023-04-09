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
        purchaseController.addPurchase(purchaseId, userId, {
            id : purchaseId,
            storeIdToBasketPurchases: new Map(),
            totalPrice: 0,
        });
        purchaseController.addProductPurchaseReview(
        userId,
        storeId,
        purchaseId,
        productId,
        review
        );
        expect(purchaseController.getPurchase(purchaseId).storeIdToBasketPurchases.get(storeId)?.Products.get(productId)?.Review).toEqual(new ProductReview(review, userId, purchaseId, "", productId));
    });
    describe("add product purchase review", () => {
        it("should not add any review because the purchaseId is wrong",  () => {
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
            purchaseController.addPurchase(purchaseId, userId, {
                id : purchaseId,
                storeIdToBasketPurchases: new Map(),
                totalPrice: 0,
            });
            purchaseController.addProductPurchaseReview(
            userId,
            storeId,
            "notPurchseId",
            productId,
            review
            );
            expect(!purchaseController.getPurchase(purchaseId).storeIdToBasketPurchases.get(storeId)?.Products.get(productId)?.Review).toEqual(new ProductReview(review, userId, purchaseId, "", productId));
        });
});



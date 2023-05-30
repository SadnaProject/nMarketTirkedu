import { beforeEach, describe, expect, it } from "vitest";
import { ProductReview } from "../ProductReview";
import { ProductReviewRepo } from "./ProductReviewsRepo";
import { itUnitIntegration } from "server/domain/_mock";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { BasketPurchase } from "../BasketPurchaseHistory";
import { CartPurchase } from "../CartPurchaseHistory";
import { CartPurchaseRepo } from "./CartPurchaseHistoryRepo";
import { getDB, resetDB } from "server/domain/_Transactional";

const productPurchase = new ProductPurchase({
  productId: "productId",
  quantity: 1,
  price: 1,
  purchaseId: "purchaseId",
});

const basketPurchase = new BasketPurchase(
  "storeId",
  new Map<string, ProductPurchase>([["productId", productPurchase]]),
  1,
  "purchaseId"
);

const cartPurchase = new CartPurchase(
  "userId",
  "purchaseId",
  new Map<string, BasketPurchase>([["storeId", basketPurchase]]),
  1
);

const productPurchase2 = new ProductPurchase({
  productId: "productId",
  quantity: 1,
  price: 1,
  purchaseId: "purchaseId2",
});

const basketPurchase2 = new BasketPurchase(
  "storeId2",
  new Map<string, ProductPurchase>([["productId", productPurchase2]]),
  1,
  "purchaseId2"
);

const cartPurchase2 = new CartPurchase(
  "userId2",
  "purchaseId2",
  new Map<string, BasketPurchase>([["storeId", basketPurchase2]]),
  1
);

const productReviewData = {
  title: "title",
  description: "description",
  productId: "productId",
  rating: 5,
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  storeId: "storeId",
};

const productReviewData2 = {
  title: "title",
  description: "description",
  productId: "productId",
  rating: 5,
  createdAt: new Date(),
  userId: "userId2",
  purchaseId: "purchaseId2",
  storeId: "storeId",
};

beforeEach(async () => {
  await resetDB();
  await getDB().user.create({
    data: {
      id: "userId",
    },
  });
  await getDB().user.create({
    data: {
      id: "userId2",
    },
  });
  const cartPurchaseRepo = new CartPurchaseRepo();
  await cartPurchaseRepo.addCartPurchase(cartPurchase);
  await cartPurchaseRepo.addCartPurchase(cartPurchase2);
});

describe("addProductReview,", () => {
  itUnitIntegration("should add a product review", async () => {
    const productReview = new ProductReview(productReviewData);
    const productReviewRepo = new ProductReviewRepo();
    await productReviewRepo.addProductReview(productReview);
    const allProductReviews = await productReviewRepo.getAllProductReviews(
      productReview.ProductId
    );
    expect(allProductReviews.length).toBe(1);
  });
});

describe("getProductReview", () => {
  itUnitIntegration("should return the product review", async () => {
    const productReview = new ProductReview(productReviewData);
    const productReviewRepo = new ProductReviewRepo();
    await productReviewRepo.addProductReview(productReview);

    expect(
      await productReviewRepo.getProductReview(
        productReview.PurchaseId,
        productReview.ProductId
      )
    ).toEqual(productReview);
  });

  itUnitIntegration(
    "should throw an error if the product review is not found",
    async () => {
      const productReview = new ProductReview(productReviewData);
      const productReviewRepo = new ProductReviewRepo();
      await productReviewRepo.addProductReview(productReview);
      await expect(() =>
        productReviewRepo.getProductReview(
          "wrongPurchaseId",
          productReview.ProductId
        )
      ).rejects.toThrow();
    }
  );
});

describe("getAllProductReviews", () => {
  itUnitIntegration("should return all product reviews", async () => {
    const productReview = new ProductReview(productReviewData);
    const productReviewRepo = new ProductReviewRepo();
    await productReviewRepo.addProductReview(productReview);
    const allreviews = await productReviewRepo.getAllProductReviews(
      productReview.ProductId
    );
    expect(allreviews.length).toBe(1);
  });
  itUnitIntegration("should return two product reviews", async () => {
    const productReview = new ProductReview(productReviewData);
    const productReview2 = new ProductReview(productReviewData2);
    const productReviewRepo = new ProductReviewRepo();
    await productReviewRepo.addProductReview(productReview);
    await productReviewRepo.addProductReview(productReview2);

    expect(productReviewRepo.getAllProductReviews(productReview.ProductId))
      .length;
  });
});

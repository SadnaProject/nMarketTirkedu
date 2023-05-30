import { expect, describe, beforeEach } from "vitest";
import { Review } from "server/domain/PurchasesHistory/Review";
import { ReviewRepo } from "./ReviewRepo";
import { CartPurchase } from "server/domain/PurchasesHistory/CartPurchaseHistory";
import { ProductPurchase } from "server/domain/PurchasesHistory/ProductPurchaseHistory";
import { BasketPurchase } from "server/domain/PurchasesHistory/BasketPurchaseHistory";
import { CartPurchaseRepo } from "./CartPurchaseHistoryRepo";
import { getDB, resetDB } from "server/helpers/_Transactional";
import { itUnitIntegration } from "server/domain/helpers/_mock";

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
  "storeId",
  new Map<string, ProductPurchase>([["productId", productPurchase2]]),
  1,
  "purchaseId2"
);

const cartPurchase2 = new CartPurchase(
  "userId",
  "purchaseId2",
  new Map<string, BasketPurchase>([["storeId", basketPurchase2]]),
  1
);

// const createReview = (repos: Repos = createRepos()) =>
//   new Review(reviewData).initRepos(repos);

beforeEach(async () => {
  await resetDB();
  await getDB().user.create({
    data: {
      id: "userId",
    },
  });
  const cartPurchaseRepo = new CartPurchaseRepo();
  await cartPurchaseRepo.addCartPurchase(cartPurchase);
  await cartPurchaseRepo.addCartPurchase(cartPurchase2);
});

const reviewData = {
  rating: 5,
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  storeId: "storeId",
};
// const createReview = (repos: Repos = createRepos()) =>
//   new Review(reviewData).initRepos(repos);

const createReview = () => new Review(reviewData);

describe("addStoreReview", () => {
  itUnitIntegration("✅adds a store review", async () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    await reviewRepo.addStoreReview(review);
    await expect(
      reviewRepo.getAllStoreReviews(review.StoreId)
    ).resolves.toEqual([review]);
  });
});

describe("getStoreReview", () => {
  itUnitIntegration("✅gets a store review", async () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    await reviewRepo.addStoreReview(review);
    await expect(
      reviewRepo.getStoreReview(review.PurchaseId, review.StoreId)
    ).resolves.toStrictEqual(review);
  });
});

describe("getAllStoreReviews", () => {
  itUnitIntegration("✅gets all store reviews", async () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    await reviewRepo.addStoreReview(review);
    await expect(
      reviewRepo.getAllStoreReviews(review.StoreId)
    ).resolves.toEqual([review]);
  });

  itUnitIntegration(
    "✅gets all store reviews when there are more than one",
    async () => {
      const reviewRepo = new ReviewRepo();
      const review = createReview();
      const review2 = new Review({
        rating: 5,
        createdAt: new Date(),
        userId: "userId",
        purchaseId: "purchaseId2",
        storeId: "storeId",
      });
      await reviewRepo.addStoreReview(review);
      await reviewRepo.addStoreReview(review2);
      await expect(
        reviewRepo.getAllStoreReviews(review.StoreId)
      ).resolves.toEqual([review, review2]);
    }
  );
});
describe("doesStoreReviewExist", () => {
  itUnitIntegration("✅returns true when store review exists", async () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    await reviewRepo.addStoreReview(review);
    await expect(
      reviewRepo.doesStoreReviewExist(review.PurchaseId, review.StoreId)
    ).resolves.toBe(true);
  });

  itUnitIntegration(
    "✅returns false when store review does not exist",
    async () => {
      const reviewRepo = new ReviewRepo();
      const review = createReview();
      await expect(
        reviewRepo.doesStoreReviewExist(review.PurchaseId, review.StoreId)
      ).resolves.toBe(false);
    }
  );
});

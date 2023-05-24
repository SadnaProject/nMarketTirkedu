import { expect, describe, beforeEach } from "vitest";
import { type Repos, createRepos } from "../_HasRepos";
import { Review } from "../Review";
import { ReviewRepo } from "./ReviewRepo";
import { itUnitIntegration } from "server/domain/_mock";
import { getDB } from "server/domain/_Transactional";
import { CartPurchase } from "../CartPurchaseHistory";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { BasketPurchase } from "../BasketPurchaseHistory";
import { CartPurchaseRepo } from "./CartPurchaseHistoryRepo";

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

const productPurchaseData = {
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  quantity: 1,
  storeId: "storeId",
  price: 1,
};
// const createReview = (repos: Repos = createRepos()) =>
//   new Review(reviewData).initRepos(repos);

beforeEach(async () => {
  await getDB().productPurchase.deleteMany({});
  await getDB().basketPurchase.deleteMany({});
  await getDB().cartPurchase.deleteMany({});
  await getDB().user.deleteMany({});
  await getDB().user.create({
    data: {
      id: "userId",
      name: "name",
      email: "email",
    },
  });
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
    ).resolves.toBe(review);
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
      const cartPurchaseRepo = new CartPurchaseRepo();
      const reviewRepo = new ReviewRepo();
      await cartPurchaseRepo.addCartPurchase(cartPurchase);
      const review = createReview();
      const review2 = createReview();
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

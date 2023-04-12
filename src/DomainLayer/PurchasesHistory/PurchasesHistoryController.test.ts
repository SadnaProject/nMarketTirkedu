import { describe, expect, it } from "vitest";
import { PurchasesHistoryController } from "./PurchasesHistoryController";
import { ProductReviewArgs, ProductReview } from "./ProductReview";
import { Repos, createRepos } from "./HasRepos";
import { Review } from "./Review";
import { ProductPurchase } from "./ProductPurchaseHistory";
import { BasketPurchase } from "./BasketPurchaseHistory";
import { CartPurchase } from "./CartPurchaseHistory";
import { ProductPurchaseRepo } from "~/DataLayer/PurchasesHistory/ProductPurchaseHistoryRepo";

const reviewData = {
  rating: 5,
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
};
const productReviewData = {
  title: "title",
  description: "description",
  ...reviewData,
};
const productPurchaseData = {
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  quantity: 1,
  price: 1,
};
const basketPurchaseData = {
  //products : Map<string, ProductPurchase>, price: number
  products: new Map<string, ProductPurchase>([
    ["productId", new ProductPurchase(productPurchaseData)],
  ]),
  price: 1,
};
const cartPurchaseData = {
  //storeIdToBasketPurchases: Map<string, BasketPurchase>, totalPrice: number
  storeIdToBasketPurchases: new Map<string, BasketPurchase>([
    [
      "storeId",
      new BasketPurchase(basketPurchaseData.products, basketPurchaseData.price),
    ],
  ]),
  totalPrice: 1,
};

const createReview = (repos: Repos = createRepos()) =>
  new Review(reviewData).initRepos(repos);
const createProductReview = (repos: Repos = createRepos()) =>
  new ProductReview(productReviewData).initRepos(repos);
const createProductPurchase = (repos: Repos = createRepos()) =>
  new ProductPurchase(productPurchaseData).initRepos(repos);
const createBasketPurchase = (repos: Repos = createRepos()) =>
  new BasketPurchase(
    basketPurchaseData.products,
    basketPurchaseData.price
  ).initRepos(repos);
const createCartPurchase = (repos: Repos = createRepos()) =>
  new CartPurchase(
    cartPurchaseData.storeIdToBasketPurchases,
    cartPurchaseData.totalPrice
  ).initRepos(repos);

describe("Review constructor", () => {
  it("✅creates a review", () => {
    const review = createReview();
    expect(review.Rating).toBe(reviewData.rating);
    expect(review.Id).toBe(reviewData.id);
    expect(review.CreatedAt).toBe(reviewData.createdAt);
    expect(review.UserId).toBe(reviewData.userId);
    expect(review.PurchaseId).toBe(reviewData.purchaseId);
    expect(review.StoreId).toBe(undefined);
  });

  it("❎gets negative rating", () => {
    expect(() => new Review({ ...reviewData, rating: -1 })).toThrow();
  });

  it("❎gets rating over 5", () => {
    expect(() => new Review({ ...reviewData, rating: 6 })).toThrow();
  });
});

describe("ProductReview constructor", () => {
  it("✅creates a product review", () => {
    const productReview = createProductReview();
    expect(productReview.Rating).toBe(reviewData.rating);
    expect(productReview.Id).toBe(reviewData.id);
    expect(productReview.CreatedAt).toBe(reviewData.createdAt);
    expect(productReview.UserId).toBe(reviewData.userId);
    expect(productReview.PurchaseId).toBe(reviewData.purchaseId);
    expect(productReview.StoreId).toBe(undefined);
    expect(productReview.Title).toBe(productReviewData.title);
    expect(productReview.Description).toBe(productReviewData.description);
  });

  it("❎gets negative rating", () => {
    expect(
      () => new ProductReview({ ...productReviewData, rating: -1 })
    ).toThrow();
  });

  it("❎gets rating over 5", () => {
    expect(
      () => new ProductReview({ ...productReviewData, rating: 6 })
    ).toThrow();
  });
  it("❎gets storeId and productId", () => {
    expect(
      () => new ProductReview({ ...productReviewData, storeId: "storeId" })
    ).toThrow();
  });
  it("❎gets undefined productId", () => {
    expect(
      () => new ProductReview({ ...productReviewData, productId: undefined })
    ).toThrow();
  });
});

// add product purchase review
describe("addProductPurchaseReview", () => {
  it("❎adds product purchase review", () => {
    const productPurchase = createProductPurchase();
    const productReview = createProductReview();
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(() =>
      purchasesHistoryController.addProductPurchaseReview(
        "userId",
        "storeId",
        "purchaseId",
        "productId",
        { ...productReviewData, rating: 5 }
      )
    ).toThrow();
  });
});

// add store purchase review
describe("addStorePurchaseReview", () => {
  it("❎adds store purchase review", () => {
    const productPurchase = createProductPurchase();
    const productReview = createProductReview();
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(() =>
      purchasesHistoryController.addStorePurchaseReview(
        "userId",
        "storeId",
        "purchaseId",
        5
      )
    ).toThrow();
  });
});

describe("getCartPurchaseByUserId", () => {
  it("✅gets cart purchase", () => {
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.addCartPurchase(
      "id",
      cartPurchase.CartPurchaseToDTO()
    );

    expect(purchasesHistoryController.getPurchasesByUser("id")).toStrictEqual([
      cartPurchase.CartPurchaseToDTO(),
    ]);
  });
  it("❎gets undefined cart purchase", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(
      purchasesHistoryController.getPurchasesByUser("userId")
    ).toStrictEqual([]);
  });
});

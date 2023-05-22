import {
  BasketPurchase,
  CartPurchase,
  ProductPurchase,
  ProductReview,
  Review as DBReview,
} from "@prisma/client";

export type ProductReviewDAO = ProductReview;

export type ReviewDAO = DBReview;

export type ProductPurchaseDAO = ProductPurchase & {
  review: ProductReviewDAO | null;
};

export type BasketPurchaseDAO = BasketPurchase & {
  products: ProductPurchaseDAO[];
  review: ReviewDAO | null;
};

export type CartPurchaseDAO = CartPurchase & {
  baskets: BasketPurchaseDAO[];
};

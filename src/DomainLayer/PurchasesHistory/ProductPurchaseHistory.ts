import { randomUUID } from "crypto";
import { HasRepos } from "./HasRepos";
import { type ProductReview, type ProductReviewDTO } from "./ProductReview";

export type ProductPurchaseDTO = {
  purchaseId: string;
  productId: string;
  quantity: number;
  price: number;
  review?: ProductReviewDTO;
};
type ProductPurchaseArgs = {
  productId: string;
  quantity: number;
  price: number;
};

export class ProductPurchase extends HasRepos {
  private purchaseId: string;
  private productId: string;
  private quantity: number;
  private price: number;
  private review?: ProductReview;

  constructor({ productId, quantity, price }: ProductPurchaseArgs) {
    super();
    this.purchaseId = randomUUID();
    this.productId = productId;
    this.quantity = quantity;
    this.price = price;
  }

  public setReview(review: ProductReview) {
    this.review = review;
  }

  public get Review() {
    return this.review;
  }
  public ProductPurchaseToDTO(): ProductPurchaseDTO {
    return {
      purchaseId: this.purchaseId,
      productId: this.productId,
      quantity: this.quantity,
      price: this.price,
      review: this.review?.ProductReviewToDTO(),
    };
  }
}

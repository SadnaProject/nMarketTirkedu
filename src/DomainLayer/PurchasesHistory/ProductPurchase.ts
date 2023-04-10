import { HasRepos } from "./HasRepos";
import { type ProductReview, type ProductReviewDTO } from "./ProductReview";

export type ProductPurchaseDTO = {
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
  private productId: string;
  private quantity: number;
  private price: number;
  private review?: ProductReview;

  constructor({ productId, quantity, price }: ProductPurchaseArgs) {
    super();
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
      productId: this.productId,
      quantity: this.quantity,
      price: this.price,
      review: this.review?.ProductReviewToDTO(),
    };
  }
}

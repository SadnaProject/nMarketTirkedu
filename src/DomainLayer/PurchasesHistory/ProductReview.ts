import { Review, type ReviewArgs, type ReviewDTO } from "./Review";

export type ProductReviewDTO = {
  title: string;
  description: string;
} & ReviewDTO;

export type ProductReviewArgs = {
  title: string;
  description: string;
} & ReviewArgs;

export class ProductReview extends Review {
  private title: string;
  private description: string;

  constructor(productReviewArgs: ProductReviewArgs, userId: string, purchaseId : string, storeId: string, productId: string) {
    super(productReviewArgs, userId, purchaseId ,storeId, productId);
    this.title = productReviewArgs.title;
    this.description = productReviewArgs.description;
  }

  public ProductReviewToDTO(): ProductReviewDTO {
    return {
      title: this.title,
      description: this.description,
      ...super.ReviewToDTO(),
    };
  }
}

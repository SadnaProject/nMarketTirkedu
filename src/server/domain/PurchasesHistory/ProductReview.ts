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

  constructor(productReviewArgs: ProductReviewArgs) {
    super(productReviewArgs);
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

  public get Title(): string {
    return this.title;
  }
  public get Description(): string {
    return this.description;
  }
}

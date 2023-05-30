import { Review, type ReviewArgs, type ReviewDTO } from "./Review";
import { ProductReviewDAO } from "./helpers/TypeHelper";

export type ProductReviewDTO = {
  title: string;
  description: string;
  productId: string;
} & ReviewDTO;

export type ProductReviewArgs = {
  title: string;
  description: string;
  productId: string;
} & ReviewArgs;

export class ProductReview extends Review {
  private title: string;
  private description: string;
  private productId: string;

  constructor(productReviewArgs: ProductReviewArgs) {
    super(productReviewArgs);
    this.title = productReviewArgs.title;
    this.description = productReviewArgs.description;
    this.productId = productReviewArgs.productId;
  }

  public ProductReviewToDTO(): ProductReviewDTO {
    return {
      title: this.title,
      description: this.description,
      productId: this.productId,
      ...super.ReviewToDTO(),
    };
  }

  public get Title(): string {
    return this.title;
  }
  public get Description(): string {
    return this.description;
  }

  public get ProductId(): string {
    return this.productId;
  }
  static fromDAO(productReviewDAO: ProductReviewDAO): ProductReview {
    return new ProductReview({
      title: productReviewDAO.title,
      description: productReviewDAO.description,
      rating: productReviewDAO.rating,
      createdAt: productReviewDAO.createdAt,
      userId: productReviewDAO.userId,
      purchaseId: productReviewDAO.purchaseId,
      storeId: productReviewDAO.storeId,
      productId: productReviewDAO.productId,
    });
  }
}

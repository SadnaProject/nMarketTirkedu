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

export class ProductPurchase {
  private productId: string;
  private quantity: number;
  private price: number;
  private review?: ProductReview;

  constructor({ productId, quantity, price }: ProductPurchaseArgs) {
    this.productId = productId;
    this.quantity = quantity;
    this.price = price;
  }
}

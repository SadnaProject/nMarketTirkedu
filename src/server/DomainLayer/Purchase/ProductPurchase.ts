import { type ProductReview } from "./ProductReview";

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

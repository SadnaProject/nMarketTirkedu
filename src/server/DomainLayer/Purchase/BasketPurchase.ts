import {
  type ProductPurchaseDTO,
  type ProductPurchase,
} from "./ProductPurchase";
import { type ProductReviewDTO } from "./ProductReview";
import { type Review } from "./Review";

export type BasketPurchaseDTO = {
  products: ProductPurchaseDTO[];
  review?: ProductReviewDTO;
};
export class BasketPurchase {
  private products: Map<string, ProductPurchase>;
  private review?: Review;
  private price: number;

  constructor(storeId: string, price: number) {
    this.products = new Map();
    this.price = price;
  }
}

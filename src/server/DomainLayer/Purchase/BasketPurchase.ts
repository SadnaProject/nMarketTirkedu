import { type ProductPurchase } from "./ProductPurchase";
import { type Review } from "./Review";

export class BasketPurchase {
  private storeId: string;
  private products: ProductPurchase[];
  private review?: Review;

  constructor(storeId: string) {
    this.storeId = storeId;
    this.products = [];
  }
}

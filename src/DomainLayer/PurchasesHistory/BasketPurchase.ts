import {
  type ProductPurchaseDTO,
  type ProductPurchase,
} from "./ProductPurchase";
import { type ProductReviewDTO } from "./ProductReview";
import { ReviewDTO, type Review } from "./Review";

export type BasketPurchaseDTO = {
  products: ProductPurchaseDTO[];
  review?: ReviewDTO;
};
export class BasketPurchase {
  private products: Map<string, ProductPurchase>;
  private review?: Review;
  private price: number;

  constructor(storeId: string, price: number) {
    this.products = new Map();
    this.price = price;
  }
  
  public get Products(): Map<string, ProductPurchase> {
    return this.products;
  }
  public BasketPurchaseToDTO(): BasketPurchaseDTO {
    return {
      products: Array.from(this.products.values()).map(
        (productPurchase) => productPurchase.ProductPurchaseToDTO()
      ),
      review: this.review?.ReviewToDTO(),
    };
  }
}

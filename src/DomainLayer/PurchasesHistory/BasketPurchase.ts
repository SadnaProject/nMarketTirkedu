import { HasRepos } from "./HasRepos";
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
export class BasketPurchase extends HasRepos{
  private products: Map<string, ProductPurchase>;
  private review?: Review;
  private price: number;

  constructor(products : Map<string, ProductPurchase>, price: number) {
    super();
    this.products = products;
    this.price = price;
  }
  
  public get Products(): Map<string, ProductPurchase> {
    return this.products;
  }

  public get Price(): number {
    return this.price;
  }
  public BasketPurchaseToDTO(): BasketPurchaseDTO {
    return {
      products: Array.from(this.products.values()).map((product) =>
        product.ProductPurchaseToDTO()
      ),
      review: this.review?.ReviewToDTO(),
    };
  }

}

import { HasRepos } from "./HasRepos";
import {
  type ProductPurchaseDTO,
  type ProductPurchase,
} from "./ProductPurchase";
import { type ProductReviewDTO } from "./ProductReview";
import { ReviewDTO, type Review } from "./Review";

export type BasketPurchaseDTO = {
  purchaseId: string;
  storeId: string;
  products: ProductPurchaseDTO[];
  review?: ReviewDTO;
};
export class BasketPurchase extends HasRepos{
  private purchaseId: string;
  private storeId: string;
  private products: Map<string, ProductPurchase>;
  private review?: Review;
  private price: number;

  constructor(storeId : string ,products : Map<string, ProductPurchase>, price: number) {
    super();
    this.storeId = storeId;
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
      purchaseId: this.purchaseId,
      storeId: this.storeId,
      products: Array.from(this.products.values()).map((product) =>
        product.ProductPurchaseToDTO()
      ),
      review: this.review?.ReviewToDTO(),
    };
  }

}

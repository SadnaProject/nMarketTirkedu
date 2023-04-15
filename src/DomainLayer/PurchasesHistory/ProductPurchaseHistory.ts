import { HasRepos } from "./HasRepos";
import { type ProductReview, type ProductReviewDTO } from "./ProductReview";
import { BasketProductDTO } from "../Users/BasketProduct";

export type ProductPurchaseDTO = {
  purchaseId: string;
  productId: string;
  quantity: number;
  price: number;
  review?: ProductReviewDTO;
};
type ProductPurchaseArgs = {
  productId: string;
  quantity: number;
  price: number;
  purchaseId: string;
};

export class ProductPurchase extends HasRepos {
  private purchaseId: string;
  private productId: string;
  private quantity: number;
  private price: number;
  private review?: ProductReview;

  constructor({ productId, quantity, price, purchaseId }: ProductPurchaseArgs) {
    super();
    this.purchaseId = purchaseId;
    this.productId = productId;
    this.quantity = quantity;
    this.price = price;
  }

  static ProductPurchaseFromBasketProductDTO(
    basketProductDTO: BasketProductDTO,
    purchaseId: string
  ): ProductPurchase {
    return new ProductPurchase({
      productId: basketProductDTO.storeProductId,
      quantity: basketProductDTO.quantity,
      price: basketProductDTO.price,
      purchaseId: purchaseId,
    });
  }

  public setReview(review: ProductReview) {
    this.review = review;
  }

  public get Review() {
    return this.review;
  }
  public ProductPurchaseToDTO(): ProductPurchaseDTO {
    return {
      purchaseId: this.purchaseId,
      productId: this.productId,
      quantity: this.quantity,
      price: this.price,
      review: this.review?.ProductReviewToDTO(),
    };
  }
  public get PurchaseId(): string {
    return this.purchaseId;
  }
}

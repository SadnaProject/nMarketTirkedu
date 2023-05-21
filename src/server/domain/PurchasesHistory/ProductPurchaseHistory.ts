import { HasRepos } from "./_HasRepos";
import { ProductReview, type ProductReviewDTO } from "./ProductReview";
import { type BasketProductDTO } from "../Users/BasketProduct";
import { StoresController } from "../Stores/StoresController";
import { ProductPurchaseDAO } from "./PurchasesHistory/CartPurchaseHistoryRepo";
import { TRPCError } from "@trpc/server";

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

  public setReview(review: ProductReview) {
    if (this.review) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Review already exists",
      });
    }
    this.review = review;
  }

  public get Review() {
    if (!this.review) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Review does not exist",
      });
    }
    return this.review;
  }
  public ToDTO(): ProductPurchaseDTO {
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

  public get ProductId(): string {
    return this.productId;
  }
  public get Quantity(): number {
    return this.quantity;
  }

  public get Price(): number {
    return this.price;
  }

  static fromDTO(ProductPurchaseDTO: ProductPurchaseDTO): ProductPurchase {
    return new ProductPurchase({
      productId: ProductPurchaseDTO.productId,
      quantity: ProductPurchaseDTO.quantity,
      price: ProductPurchaseDTO.price,
      purchaseId: ProductPurchaseDTO.purchaseId,
    });
  }

  public static fromDAO(
    ProductPurchaseDAO: ProductPurchaseDAO
  ): ProductPurchase {
    const productPurchase = new ProductPurchase({
      productId: ProductPurchaseDAO.productId,
      quantity: ProductPurchaseDAO.quantity,
      price: ProductPurchaseDAO.price,
      purchaseId: ProductPurchaseDAO.purchaseId,
    });
    if (ProductPurchaseDAO.review) {
      productPurchase.review = ProductReview.fromDAO(ProductPurchaseDAO.review);
    }
    return productPurchase;
  }
}

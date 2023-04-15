import { HasRepos } from "./HasRepos";
import {
  type ProductPurchaseDTO,
  ProductPurchase,
} from "./ProductPurchaseHistory";
import { type ProductReviewDTO } from "./ProductReview";
import { ReviewDTO, type Review } from "./Review";
import { BasketDTO } from "../Users/Basket";

export type BasketPurchaseDTO = {
  purchaseId: string;
  storeId: string;
  products: ProductPurchaseDTO[];
  review?: ReviewDTO;
};
export class BasketPurchase extends HasRepos {
  private purchaseId: string;
  private storeId: string;
  private products: Map<string, ProductPurchase>;
  private review?: Review;
  private price: number;

  constructor(
    storeId: string,
    products: Map<string, ProductPurchase>,
    price: number,
    purchaseId: string
  ) {
    super();
    this.purchaseId = purchaseId;
    this.storeId = storeId;
    this.products = products;
    this.price = price;
  }

  static BasketPurchaseFromBasketDTO(
    basketDTO: BasketDTO,
    purchaseId: string
  ): BasketPurchase {
    const products = new Map<string, ProductPurchase>();
    basketDTO.products.forEach((product) => {
      products.set(
        product.storeProductId,
        ProductPurchase.ProductPurchaseFromBasketProductDTO(product, purchaseId)
      );
    });
    return new BasketPurchase(
      basketDTO.storeId,
      products,
      basketDTO.price,
      purchaseId
    );
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
  public get StoreId(): string {
    return this.storeId;
  }
  public get PurchaseId(): string {
    return this.purchaseId;
  }
}

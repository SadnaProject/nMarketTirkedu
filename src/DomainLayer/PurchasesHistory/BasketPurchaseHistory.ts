import { HasRepos } from "./_HasRepos";
import {
  type ProductPurchaseDTO,
  ProductPurchase,
} from "./ProductPurchaseHistory";
import { type ProductReviewDTO } from "./ProductReview";
import { ReviewDTO, type Review } from "./Review";
import { BasketDTO } from "../Users/Basket";
import { UsersController } from "../Users/UsersController";
import { StoresController } from "../Stores/StoresController";

export type BasketPurchaseDTO = {
  purchaseId: string;
  storeId: string;
  products: Map<string, ProductPurchaseDTO>; // product id to product purchase
  review?: ReviewDTO;
  price: number;
};
export class BasketPurchase extends HasRepos {
  private purchaseId: string;
  private storeId: string;
  private products: Map<string, ProductPurchase>; // product id to product purchase
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

  static BasketPurchaseDTOFromBasketDTO(
    basketDTO: BasketDTO,
    purchaseId: string
  ): BasketPurchaseDTO {
    const products = new Map<string, ProductPurchaseDTO>();
    basketDTO.products.forEach((product) => {
      products.set(
        product.storeProductId,
        ProductPurchase.ProductPurchaseDTOFromBasketProductDTO(
          product,
          purchaseId
        )
      );
    });
    return {
      purchaseId: purchaseId,
      storeId: basketDTO.storeId,
      products: products,
      price: new StoresController().getBasketPrice(basketDTO),
    };
  }

  public get Products(): Map<string, ProductPurchase> {
    return this.products;
  }

  public get Price(): number {
    return this.price;
  }
  public ToDTO(): BasketPurchaseDTO {
    const products = new Map<string, ProductPurchaseDTO>();
    this.products.forEach((productPurchase, productId) => {
      products.set(productId, productPurchase.ToDTO());
    });

    return {
      purchaseId: this.purchaseId,
      storeId: this.storeId,
      products: products,
      review: this.review?.ReviewToDTO(),
      price: this.price,
    };
  }
  public get StoreId(): string {
    return this.storeId;
  }
  public get PurchaseId(): string {
    return this.purchaseId;
  }
  static fromDTO(BasketPurchaseDTO: BasketPurchaseDTO) {
    const products = new Map<string, ProductPurchase>();
    BasketPurchaseDTO.products.forEach((productPurchase, productId) => {
      products.set(productId, ProductPurchase.fromDTO(productPurchase));
    });
    return new BasketPurchase(
      BasketPurchaseDTO.storeId,
      products,
      BasketPurchaseDTO.price,
      BasketPurchaseDTO.purchaseId
    );
  }
}

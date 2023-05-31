import { HasRepos } from "./helpers/_HasRepos";
import {
  type ProductPurchaseDTO,
  ProductPurchase,
} from "./ProductPurchaseHistory";
import { type ReviewDTO, Review } from "./Review";
import { type BasketPurchaseDAO } from "./helpers/TypeHelper";

export type BasketPurchaseDTO = {
  purchaseId: string;
  storeId: string;
  products: Map<string, ProductPurchaseDTO>; // product id to product purchase
  review?: ReviewDTO;
  price: number;
};
export class BasketPurchase {
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
    // super();
    this.purchaseId = purchaseId;
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

  static fromDAO(basketPurchaseDAO: BasketPurchaseDAO) {
    const products = new Map<string, ProductPurchase>();
    const productPurchaseDAOs = basketPurchaseDAO.products;
    productPurchaseDAOs.forEach((productPurchase) => {
      products.set(
        productPurchase.productId,
        ProductPurchase.fromDAO(productPurchase)
      );
    });
    const basketPurchase = new BasketPurchase(
      basketPurchaseDAO.storeId,
      products,
      basketPurchaseDAO.price,
      basketPurchaseDAO.purchaseId
    );
    if (basketPurchaseDAO.review) {
      basketPurchase.review = Review.fromDAO(basketPurchaseDAO.review);
    }
    return basketPurchase;
  }
}

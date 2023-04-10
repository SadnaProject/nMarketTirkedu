import { BasketPurchaseRepo } from "~/DataLayer/Purchases/BasketPurchaseRepo";
import { CartPurchaseRepo } from "~/DataLayer/Purchases/CartPurchaseRepo";
import { ProductPurchaseRepo } from "~/DataLayer/Purchases/ProductPurchaseRepo";
import { ProductReviewRepo } from "~/DataLayer/Purchases/ProductReviewsRepo";
import { ReviewRepo } from "~/DataLayer/Purchases/ReviewRepo";


export type Repos = {
  Reviews: ReviewRepo;
  ProductsPurchases: ProductPurchaseRepo;
  ProductReviews: ProductReviewRepo;
  BasketPurchases: BasketPurchaseRepo;
  CartPurchases: CartPurchaseRepo;
};

export function createRepos(): Repos {
  return {
    Reviews: new ReviewRepo(), 
    ProductsPurchases: new ProductPurchaseRepo(),
    ProductReviews: new ProductReviewRepo(),
    BasketPurchases: new BasketPurchaseRepo(),
    CartPurchases: new CartPurchaseRepo(),
  };
}

export class HasRepos {
  private repos?: Repos;

  public initRepos(repos: Repos) {
    this.repos = repos;
    return this;
  }

  public get Repos(): Repos {
    if (this.repos === undefined) {
      throw new Error("PurchaseHistory has no repos");
    }
    return this.repos;
  }
}

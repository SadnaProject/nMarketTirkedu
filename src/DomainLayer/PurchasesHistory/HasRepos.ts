import { BasketPurchaseRepo } from "~/DataLayer/PurchasesHistory/BasketPurchaseHistoryRepo";
import { CartPurchaseRepo } from "~/DataLayer/PurchasesHistory/CartPurchaseHistoryRepo";
import { ProductPurchaseRepo } from "~/DataLayer/PurchasesHistory/ProductPurchaseHistoryRepo";
import { ProductReviewRepo } from "~/DataLayer/PurchasesHistory/ProductReviewsRepo";
import { ReviewRepo } from "~/DataLayer/PurchasesHistory/ReviewRepo";

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

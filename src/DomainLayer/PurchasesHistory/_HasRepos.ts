import { BasketPurchaseRepo } from "~/DomainLayer/PurchasesHistory/PurchasesHistory/BasketPurchaseHistoryRepo";
import { CartPurchaseRepo } from "~/DomainLayer/PurchasesHistory/PurchasesHistory/CartPurchaseHistoryRepo";
import { ProductPurchaseRepo } from "~/DomainLayer/PurchasesHistory/PurchasesHistory/ProductPurchaseHistoryRepo";
import { ProductReviewRepo } from "~/DomainLayer/PurchasesHistory/PurchasesHistory/ProductReviewsRepo";
import { ReviewRepo } from "~/DomainLayer/PurchasesHistory/PurchasesHistory/ReviewRepo";

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

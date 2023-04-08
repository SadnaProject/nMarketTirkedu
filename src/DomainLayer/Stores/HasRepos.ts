import { StoreProductsRepo } from "~/DataLayer/Stores/StoreProductsRepo";
import { StoresRepo } from "~/DataLayer/Stores/StoresRepo";

export type Repos = {
  Stores: StoresRepo;
  Products: StoreProductsRepo;
};

export function createRepos(): Repos {
  return {
    Products: new StoreProductsRepo(),
    Stores: new StoresRepo(),
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
      throw new Error("Repos of stores component are not initialized");
    }
    return this.repos;
  }
}

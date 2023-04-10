import { UserRepo } from "./UserRepo";
export type Repos = {
    Users: UserRepo;
};

export function createRepos(): Repos {
  return {
    Users: new UserRepo(),
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

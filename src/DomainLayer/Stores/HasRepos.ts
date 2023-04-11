import { StoreProductsRepo } from "~/DataLayer/Stores/StoreProductsRepo";
import { StoresRepo } from "~/DataLayer/Stores/StoresRepo";

export const reposMapping = {
  Stores: StoresRepo,
  Products: StoreProductsRepo,
};

// NO TOUCHY BELOW THIS LINE 😉

export class HasRepos {
  private repos?: Repos;

  public initRepos(repos: Repos) {
    this.repos = repos;
    return this;
  }

  public get Repos(): Repos {
    if (this.repos === undefined) {
      throw new Error("Repos are not initialized");
    }
    return this.repos;
  }
}

export type Repos = {
  [key in keyof typeof reposMapping]: InstanceType<(typeof reposMapping)[key]>;
};

export function createRepos() {
  const repos: Record<string, unknown> = {};
  for (const [key, Repo] of Object.entries(reposMapping)) {
    repos[key] = new Repo();
  }
  return repos as Repos;
}

export function createTestRepos() {
  const repos: Record<string, unknown> = {};
  for (const [key, Repo] of Object.entries(reposMapping)) {
    repos[key] = new Repo().test();
  }
  return repos as Repos;
}

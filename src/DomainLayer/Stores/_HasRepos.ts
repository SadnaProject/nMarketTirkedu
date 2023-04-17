import { StoreProductsRepo } from "./Repos/StoreProductsRepo";
import { StoresRepo } from "./Repos/StoresRepo";

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

export function createMockRepos(testedRepo: keyof Repos | null = null) {
  const repos: Record<string, unknown> = {};
  for (const [key, Repo] of Object.entries(reposMapping)) {
    let repo = new Repo();
    if (key !== testedRepo) {
      repo = repo.test();
    }
    repos[key] = repo;
  }
  return repos as Repos;
}

export function createTestRepos(testType: string) {
  switch (testType) {
    case "unit":
      return createMockRepos();
    case "integration":
      return createRepos();
    default:
      throw new Error(`Unknown test type: ${testType}`);
  }
}
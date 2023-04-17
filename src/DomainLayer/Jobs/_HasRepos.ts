import { UserAuthRepo } from "~/DomainLayer/Auth/UserAuthRepo";
import { JobsRepo } from "~/DomainLayer/Jobs/JobsRepo";

export const reposMapping = {
  jobs: JobsRepo,
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

export function createMockRepos() {
  const repos: Record<string, unknown> = {};
  for (const [key, Repo] of Object.entries(reposMapping)) {
    repos[key] = new Repo().test();
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

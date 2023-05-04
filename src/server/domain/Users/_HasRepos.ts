import { UserRepo } from "./UserRepo";
import { TRPCError } from "@trpc/server";
export const reposMapping = {
  Users: UserRepo,
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
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Repos not initialized",
      });  
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

export function createTestRepos(
  testType: string,
  testedRepo: keyof Repos | null = null
) {
  switch (testType) {
    case "unit":
      return createMockRepos(testedRepo);
    case "integration":
      return createRepos();
    default:
      throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Invalid test type"});
  }
}

import { beforeEach, describe, expect, it } from "vitest";
import { type Repos, createTestRepos } from "./_HasRepos";
import { GuestUserAuth } from "../Auth/GuestUserAuth";
import { MemberUserAuth } from "../Auth/MemberUserAuth";
import { PositionHolder } from "./PositionHolder";
import { FounderRole } from "./FounderRole";
import { OwnerRole } from "./OwnerRole";
import { JobsController } from "./JobsController";
import { AuthController } from "../Auth/AuthController";

export function createMember(name: string, password: string) {
  return MemberUserAuth.create(name, password);
}
function getMemberI(i: number): MemberUserAuth {
  return MemberUserAuth.create(
    "user" + i.toString() + "@email.com",
    "password" + i.toString()
  );
}
function getGuestI(i: number): GuestUserAuth {
  return GuestUserAuth.create();
}
let controllers: { Jobs: JobsController; Auth: AuthController };
let repos: Repos;
const ownerRole: OwnerRole = OwnerRole.getOwnerRole();
const founderRole: FounderRole = FounderRole.getFounderRole();
// let controllers: Controllers;
beforeEach(async () => {
  const testType = "integration";
  // controllers = createTestControllers(testType, "Users");
  // repos = createTestRepos(testType, "jobs");
  controllers = { Jobs: new JobsController(), Auth: new AuthController() };
  repos = createTestRepos(testType);
  controllers.Jobs.initRepos(repos);
  // repos = { jobs: new JobsRepo() };
  // controllers.Auth.initRepos(repos);
});
//TODO: delete this.
describe("trying out db", () => {
  it("add store founder", async () => {
    const founder = getMemberI(1);
    const positionHolder: PositionHolder = new PositionHolder(
      founderRole,
      "store1",
      founder.UserId
    );
    await repos.jobs.SetStoreFounder(positionHolder);
    const FounderTOAppoint: PositionHolder = new PositionHolder(
      founderRole,
      "store1",
      "abc"
    );
    await positionHolder.appointStoreOwner("owner1");
    await positionHolder.appointStoreManager("manager1");
    const founder2 = await repos.jobs.GetStoreFounder("store1");
    // expect(founder2).toEqual(founder);
    await positionHolder.setAppointeePermission("manager1", true, "AddProduct");
    await positionHolder.setAppointeePermission(
      "manager1",
      false,
      "receivePrivateStoreData"
    );
    // console.log(founder2);
    // console.log(await controllers.Jobs.getJobsHierarchyOfStore("store1"));
  });
});

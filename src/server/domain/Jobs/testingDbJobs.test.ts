import { beforeEach, describe, expect, it } from "vitest";
import { type Repos, createTestRepos } from "./_HasRepos";

import { itUnitIntegration } from "../_mock";
import { createTestControllers } from "../_createControllers";
import { type Controllers } from "../_HasController";
import { GuestUserAuth } from "../Auth/GuestUserAuth";
import { MemberUserAuth } from "../Auth/MemberUserAuth";
import { PositionHolder } from "./PositionHolder";
import { Role } from "./Role";
import { FounderRole } from "./FounderRole";
import { OwnerRole } from "./OwnerRole";
import { db } from "server/db";
import exp from "constants";
import { JobsRepo } from "./JobsRepo";

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
let repos: Repos;
const ownerRole: OwnerRole = OwnerRole.getOwnerRole();
const founderRole: FounderRole = FounderRole.getFounderRole();
// let controllers: Controllers;
beforeEach(async () => {
  //delete all data in db
  await db.positionHolder.deleteMany({});
  await db.role.deleteMany({});
  const testType = "integration";
  // controllers = createTestControllers(testType, "Users");
  repos = createTestRepos(testType, "jobs");
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
    console.log(founder2);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { type Repos, createTestRepos } from "./_HasRepos";
import { MemberUserAuth } from "./MemberUserAuth";
import { GuestUserAuth } from "./GuestUserAuth";
import { itUnitIntegration } from "../_mock";
import { createTestControllers } from "../_createControllers";
import { type Controllers } from "../_HasController";
import { getDB } from "server/domain/_Transactional";

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
let controllers: Controllers;
beforeEach(async () => {
  //delete all data in db
  await getDB().userAuth.deleteMany({});
  const testType = "integration";
  // controllers = createTestControllers(testType, "Users");
  repos = createTestRepos(testType);
  // controllers.Auth.initRepos(repos);
});
//TODO: delete this.
describe("trying out db", () => {
  it("✅adds member", async () => {
    expect(true);
    const member = getMemberI(1);
    await repos.Users.addMember(member);
    const userByEmail = await repos.Users.getMemberByEmail(member.Email);
    console.log("userByEmail", userByEmail);
    expect(userByEmail).toEqual(member);
    expect(await repos.Users.doesMemberExistByEmail(member.Email)).toEqual(
      true
    );
  });
});

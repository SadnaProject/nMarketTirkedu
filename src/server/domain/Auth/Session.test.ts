import { beforeEach, describe, expect, it } from "vitest";
import { type Repos, createTestRepos } from "./_HasRepos";
import { MemberUserAuth } from "./MemberUserAuth";
import { Session } from "./Session";

export function createMember(name: string, password: string) {
  return MemberUserAuth.create(name, password);
}
function getMemberI(i: number): MemberUserAuth {
  return MemberUserAuth.create(
    "user" + i.toString() + "@email.com",
    "password" + i.toString()
  );
}
const member = getMemberI(1);
//Testing Session.ts
describe("create session", () => {
  it("✅creates session", () => {
    const session = new Session(member.UserId);
    expect(session).not.toBeNull();
    expect(session.UserId).toEqual(member.UserId);
  });
});
describe("session validity", () => {
  it("✅checks session validity", () => {
    const session = new Session(member.UserId);
    expect(session.isValid()).toBeTruthy();
  });
  it("❎checks session validity", () => {
    const session = new Session(member.UserId);
    session.ExpirationDateTime = new Date(new Date().getTime() - 1000);
    expect(session.isValid()).toBeFalsy();
  });
});
describe("Invalidating session", () => {
  it("✅invalidates session", () => {
    const session = new Session(member.UserId);
    expect(session.isValid()).toBeTruthy();
    session.invalidate();
    expect(session.isValid()).toBeFalsy();
  });
});

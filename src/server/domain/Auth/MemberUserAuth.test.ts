import { describe, expect, it, vi } from "vitest";
import { MemberUserAuth } from "./MemberUserAuth";
import { GuestUserAuth } from "./GuestUserAuth";
import { itUnitIntegration } from "../_mock";

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
describe("create member", () => {
  it("✅creates member", () => {
    const member = MemberUserAuth.create("user1@gmail.com", "password1");
    expect(member).not.toBeNull();
    expect(member.Email).toEqual("user1@gmail.com");
    expect(member.isPasswordCorrect("password1")).toBeTruthy();
  });
  it("❎does not create member with invalid email", () => {
    expect(() =>
      MemberUserAuth.create("user1gmail.com", "password1")
    ).toThrow();
  });
});
describe("login member", () => {
  it("✅logs in member", (testType) => {
    const member = getMemberI(1);
    vi.spyOn(member, "isConnectionValid").mockReturnValue(false);
    expect(member.isUserLoggedInAsMember()).toBeFalsy();
    member.login();
    vi.spyOn(member, "isConnectionValid").mockReturnValue(true);
    expect(member.isUserLoggedInAsMember()).toBeTruthy();
  });
  // itUnitIntegration(
  //   "❎does not log in member because he is already logged in",
  //   (testType) => {
  //     const member = getMemberI(1);
  //     vi.spyOn(member, "isConnectionValid").mockReturnValue(false);
  //     member.login();
  //     vi.spyOn(member, "isConnectionValid").mockReturnValue(true);
  //     expect(member.isUserLoggedInAsMember()).toBeTruthy();
  //     expect(() => member.login()).toThrow();
  //   }
  // );
});

describe("logout member", () => {
  it("✅logs out member", (testType) => {
    const member = getMemberI(1);
    vi.spyOn(member, "isConnectionValid").mockReturnValue(false);
    member.login();
    vi.spyOn(member, "isConnectionValid").mockReturnValue(true);
    expect(member.isUserLoggedInAsMember()).toBeTruthy();
    member.logout();
    vi.spyOn(member, "isConnectionValid").mockReturnValue(false);
    expect(member.isUserLoggedInAsMember()).toBeFalsy();
  });
});

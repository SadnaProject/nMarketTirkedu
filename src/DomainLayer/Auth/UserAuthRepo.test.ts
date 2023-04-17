import { beforeEach, describe, expect, it } from "vitest";
import { type Repos, createTestRepos } from "./HasRepos";
import { MemberUserAuth } from "./MemberUserAuth";
import { GuestUserAuth } from "./GuestUserAuth";

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
beforeEach(() => {
  repos = createTestRepos("Users");
});
describe("add user", () => {
  it("✅adds member", () => {
    expect(true);
    const member = getMemberI(1);
    expect(() => repos.Users.addMember(member)).not.toThrow();
    expect(repos.Users.getAllMembers()).toEqual([member]);
  });
  //a test for adding a new guest
  it("✅adds guest", () => {
    expect(true);
    const guest = getGuestI(1);
    expect(() => repos.Users.addGuest(guest)).not.toThrow();
    expect(repos.Users.getAllGuests()).toEqual([guest]);
  });
});
describe("get all members", () => {
  it("✅returns no members", () => {
    expect(repos.Users.getAllMembers()).toEqual([]);
  });
  it("✅returns some members", () => {
    const member1 = getMemberI(1);
    const member2 = getMemberI(2);
    repos.Users.addMember(member1);
    repos.Users.addMember(member2);
    expect(repos.Users.getAllMembers()).toEqual([member1, member2]);
  });
});
describe("get all guests", () => {
  it("✅returns no guests", () => {
    expect(repos.Users.getAllGuests()).toEqual([]);
  });

  it("✅returns some guests", () => {
    const guest1 = getGuestI(1);
    const guest2 = getGuestI(2);
    repos.Users.addGuest(guest1);
    repos.Users.addGuest(guest2);
    expect(repos.Users.getAllGuests()).toEqual([guest1, guest2]);
  });
});
describe("get member by id", () => {
  it("✅returns member", () => {
    const member = getMemberI(1);
    repos.Users.addMember(member);
    expect(repos.Users.getMemberById(member.UserId)).toEqual(member);
  });
  it("❎doesn't find member", () => {
    expect(() => repos.Users.getMemberById("made up id")).toThrow();
  });
});
describe("get guest by id", () => {
  it("✅returns guest", () => {
    const guest = getGuestI(1);
    repos.Users.addGuest(guest);
    expect(repos.Users.getGuestById(guest.UserId)).toEqual(guest);
  });
  it("❎doesn't find guest", () => {
    expect(() => repos.Users.getGuestById("made up id")).toThrow();
  });
});
describe("remove member", () => {
  it("✅removes member", () => {
    const member = getMemberI(1);
    repos.Users.addMember(member);
    expect(() => repos.Users.removeMember(member.UserId)).not.toThrow();
    expect(repos.Users.getAllMembers()).toEqual([]);
  });
  it("❎doesn't find member", () => {
    expect(() => repos.Users.removeMember(getMemberI(1).UserId)).toThrow();
  });
});
describe("remove guest", () => {
  it("✅removes guest", () => {
    const guest = getGuestI(1);
    repos.Users.addGuest(guest);
    expect(() => repos.Users.removeGuest(guest.UserId)).not.toThrow();
    expect(repos.Users.getAllGuests()).toEqual([]);
  });
  it("❎doesn't find guest", () => {
    expect(() => repos.Users.removeGuest(getGuestI(1).UserId)).toThrow();
  });
});

import { GuestUserAuth } from "server/domain/Auth/GuestUserAuth";
import { MemberUserAuth } from "server/domain/Auth/MemberUserAuth";
import {
  type Repos,
  createMockRepos,
} from "server/domain/Auth/helpers/_HasRepos";
import { resetDB } from "server/helpers/_Transactional";
import { beforeEach, describe, expect, it } from "vitest";

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
beforeEach(async () => {
  repos = createMockRepos("Users");
  await resetDB();
});
describe("add user", () => {
  it("✅adds member", async () => {
    expect(true);
    const member = getMemberI(1);
    // expect(() => repos.Users.addMember(member)).not.toThrow();
    await expect(repos.Users.addMember(member)).resolves.not.toThrow();
    // expect(repos.Users.getAllMembers()).toEqual([member]);
    await expect(repos.Users.getAllMembers()).resolves.toEqual([member]);
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
  it("✅returns no members", async () => {
    expect(await repos.Users.getAllMembers()).toEqual([]);
  });
  it("✅returns some members", async () => {
    const member1 = getMemberI(1);
    const member2 = getMemberI(2);
    await repos.Users.addMember(member1);
    await repos.Users.addMember(member2);
    // expect(await repos.Users.getAllMembers()).toEqual([member1, member2]);
    await expect(repos.Users.getAllMembers()).resolves.toEqual([
      member1,
      member2,
    ]);
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
  it("✅returns member", async () => {
    const member = getMemberI(1);
    await repos.Users.addMember(member);
    // expect(repos.Users.getMemberById(member.UserId)).toEqual(member);
    await expect(repos.Users.getMemberById(member.UserId)).resolves.toEqual(
      member
    );
  });
  it("❎doesn't find member", async () => {
    // expect(() => repos.Users.getMemberById("made up id")).toThrow();
    await expect(repos.Users.getMemberById("made up id")).rejects.toThrow(
      "user with id: made up id not found"
    );
  });
});
describe("get guest by id", () => {
  it("✅returns guest", () => {
    const guest = getGuestI(1);
    repos.Users.addGuest(guest);
    expect(repos.Users.getGuestById(guest.UserId)).toEqual(guest);
  });
  it("❎doesn't find guest", () => {
    expect(() => repos.Users.getGuestById("made up id")).toThrow(
      "User with id: made up id not found"
    );
  });
});
describe("remove member", () => {
  it("✅removes member", async () => {
    const member = getMemberI(1);
    await repos.Users.addMember(member);
    // expect(() => repos.Users.removeMember(member.UserId)).not.toThrow();
    await expect(repos.Users.removeMember(member.UserId)).resolves.not.toThrow(
      "User with id: made up id not found"
    );
    // expect(repos.Users.getAllMembers()).toEqual([]);
    await expect(repos.Users.getAllMembers()).resolves.toEqual([]);
  });
  it("❎doesn't find member", async () => {
    const members = await repos.Users.getAllMembers();
    // expect(() => repos.Users.removeMember(getMemberI(1).UserId)).toThrow();
    const memberId = getMemberI(1).UserId;
    await expect(repos.Users.removeMember(memberId)).rejects.toThrow(
      "user with id: " + memberId + " not found"
    );
    // expect(repos.Users.getAllMembers()).toEqual(members);
    await expect(repos.Users.getAllMembers()).resolves.toEqual(members);
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
    const guests = repos.Users.getAllGuests();
    const guestId = getGuestI(1).UserId;
    expect(() => repos.Users.removeGuest(guestId)).toThrow(
      "User with id: " +
        guestId +
        " is not a guest, please try again with a different user"
    );
    expect(repos.Users.getAllGuests()).toEqual(guests);
  });
});

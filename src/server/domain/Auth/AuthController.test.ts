/* eslint-disable @typescript-eslint/no-empty-function */
import { beforeEach, describe, expect, vi } from "vitest";
import { type Repos, createMockRepos, createTestRepos } from "./_HasRepos";
import { MemberUserAuth } from "./MemberUserAuth";
import { GuestUserAuth } from "./GuestUserAuth";
import { itUnitIntegration } from "../_mock";
import {
  createMockControllers,
  createTestControllers,
} from "../_createControllers";
import { type Controllers } from "../_HasController";
import { AuthController } from "./AuthController";
import { db } from "server/db";

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
let controllers: { Auth: AuthController };
function generateEmailI(i: number): string {
  return "user" + i.toString() + "@email.com";
}
function generatePasswordI(i: number): string {
  return "password" + i.toString();
}
beforeEach(() => {
  repos = createMockRepos();
  controllers = { Auth: new AuthController() };
});
describe("starts session", () => {
  itUnitIntegration("✅starts session", async (testType) => {
    repos = createTestRepos(testType);
    controllers.Auth.initRepos(repos);
    await db.userAuth.deleteMany({});
    vi.spyOn(repos.Users, "doesMemberExistById").mockResolvedValue(false);
    vi.spyOn(repos.Users, "getGuestById").mockReturnValue(getGuestI(1));
    vi.spyOn(repos.Users, "addGuest").mockImplementation(() => {});
    vi.spyOn(repos.Users, "doesMemberExistById").mockResolvedValue(false);
    vi.spyOn(GuestUserAuth, "create").mockImplementation(() => {
      const guest = new GuestUserAuth();
      // vi.spyOn(guest, "isConnectionValid").mockReturnValue(true);
      return guest;
    });
    vi.spyOn(GuestUserAuth.prototype, "isConnectionValid").mockReturnValue(
      true
    );
    let guestId = "";
    expect(() => (guestId = controllers.Auth.startSession())).not.toThrow();
    vi.spyOn(repos.Users, "doesGuestExistById").mockReturnValue(true);
    expect(guestId).not.toEqual("");
    expect(controllers.Auth.isGuest(guestId)).toEqual(true);
    expect(await controllers.Auth.isMember(guestId)).toEqual(false);
    expect(await controllers.Auth.isConnected(guestId)).toEqual(true);
  });
});
describe("register member", () => {
  itUnitIntegration("✅registers member", async (testType) => {
    repos = createTestRepos(testType);
    controllers.Auth.initRepos(repos);
    await db.userAuth.deleteMany({});
    // vi.spyOn(MemberUserAuth, "create").mockImplementation(
    //   (email: string, password: string) => {
    //     const mockUser: MemberUserAuth = new (
    //       MemberUserAuth as any
    //     ).constructor();
    //     mockUser.Email = email;
    //     mockUser.Password = password;
    //     return mockUser;
    //   }
    // );
    const validateEmailLegality = vi
      .spyOn(MemberUserAuth.prototype as any, "validateEmailLegality")
      .mockImplementation(() => {});
    const validatePasswordLegality = vi
      .spyOn(MemberUserAuth.prototype as any, "validatePasswordLegality")
      .mockImplementation(() => {});
    vi.spyOn(repos.Users, "doesMemberExistByEmail").mockResolvedValue(false);
    vi.spyOn(repos.Users, "addMember").mockImplementation(async () => {});
    // expect(
    //   async () => await controllers.Auth.register("email@gmail.com", "password")
    // ).not.toThrow();
    await expect(
      controllers.Auth.register("email@gmail.com", "password")
    ).resolves.not.toThrow();
    // await controllers.Auth.register("email@gmail.com", "password");
    vi.spyOn(repos.Users, "doesMemberExistByEmail").mockResolvedValue(true);
    // expect(await repos.Users.doesMemberExistByEmail("email@gmail.com")).toEqual(
    //   true
    // );
    await expect(
      repos.Users.doesMemberExistByEmail("email@gmail.com")
    ).resolves.toEqual(true);
  });
  itUnitIntegration(
    "❎fails to register member with existing email",
    async (testType) => {
      await db.userAuth.deleteMany({});
      repos = createTestRepos(testType);
      controllers.Auth.initRepos(repos);
      const validateEmailLegality = vi
        .spyOn(MemberUserAuth.prototype as any, "validateEmailLegality")
        .mockImplementation(() => {});
      const validatePasswordLegality = vi
        .spyOn(MemberUserAuth.prototype as any, "validatePasswordLegality")
        .mockImplementation(() => {});
      vi.spyOn(repos.Users, "doesMemberExistByEmail").mockResolvedValue(false);
      vi.spyOn(repos.Users, "addMember").mockImplementation(async () => {});
      await controllers.Auth.register("user1@gmail.com", "password");
      vi.spyOn(repos.Users, "doesMemberExistByEmail").mockResolvedValue(true);
      // expect(() =>
      //   controllers.Auth.register("user1@gmail.com", "password2")
      // ).toThrow();
      await expect(
        controllers.Auth.register("user1@gmail.com", "password2")
      ).rejects.toThrow();
      // expect(repos.Users.doesMemberExistByEmail("user1@gmail.com")).toEqual(
      //   true
      // );
      await expect(
        repos.Users.doesMemberExistByEmail("user1@gmail.com")
      ).resolves.toEqual(true);
    }
  );
});
describe("login member", () => {
  itUnitIntegration("✅logs in member", async (testType) => {
    repos = createTestRepos(testType);
    controllers.Auth.initRepos(repos);
    await db.userAuth.deleteMany({});
    vi.spyOn(MemberUserAuth.prototype, "isPasswordCorrect").mockReturnValue(
      true
    );
    // vi.spyOn(repos.Users, "doesMemberExistById").mockReturnValue(true);
    // vi.spyOn(repos.Users, "getMemberById").mockReturnValue(getMemberI(1));
    // vi.spyOn(repos.Users, "doesMemberExistById").mockReturnValue(true);
    vi.spyOn(GuestUserAuth, "create").mockImplementation(() => {
      const guest = new GuestUserAuth();
      // vi.spyOn(guest, "isConnectionValid").mockReturnValue(true);
      return guest;
    });

    const validateEmailLegality = vi
      .spyOn(MemberUserAuth.prototype as any, "validateEmailLegality")
      .mockImplementation(() => {});
    const validatePasswordLegality = vi
      .spyOn(MemberUserAuth.prototype as any, "validatePasswordLegality")
      .mockImplementation(() => {});
    vi.spyOn(repos.Users, "removeGuest").mockImplementation(() => {});
    vi.spyOn(repos.Users, "addGuest").mockImplementation(() => {});
    vi.spyOn(repos.Users, "addMember").mockImplementation(async () => {});
    vi.spyOn(repos.Users, "doesMemberExistByEmail").mockReturnValue(
      Promise.resolve(false)
    );
    const guestId = controllers.Auth.startSession();
    await controllers.Auth.register(generateEmailI(1), generatePasswordI(1));
    vi.spyOn(repos.Users, "doesMemberExistByEmail").mockReturnValue(
      Promise.resolve(true)
    );
    vi.spyOn(repos.Users, "getMemberByEmail").mockReturnValue(
      Promise.resolve(getMemberI(1))
    );
    vi.spyOn(repos.Users, "doesGuestExistById").mockReturnValue(true);

    const memberId = await controllers.Auth.login(
      guestId,
      generateEmailI(1),
      generatePasswordI(1)
    );
    vi.spyOn(repos.Users, "doesGuestExistById").mockReturnValue(false);
    expect(controllers.Auth.isGuest(guestId)).toEqual(false);
    // expect(controllers.Auth.isMember(memberId)).toEqual(true);
    vi.spyOn(repos.Users, "doesMemberExistById").mockResolvedValue(true);
    vi.spyOn(repos.Users, "getMemberById").mockReturnValue(
      Promise.resolve(getMemberI(1))
    );
    vi.spyOn(
      MemberUserAuth.prototype,
      "isUserLoggedInAsMember"
    ).mockReturnValue(true);
    expect(await controllers.Auth.isConnected(memberId)).toEqual(true);
  });
});
//TODO resolve sessions and then run this test
// describe("get all members", () => {
//   itUnitIntegration("✅gets all logged in/out members", async (testType) => {
//     testType = "integration";
//     repos = createTestRepos(testType);
//     controllers.Auth.initRepos(repos);
//     await db.userAuth.deleteMany({});

//     await controllers.Auth.register(generateEmailI(1), generatePasswordI(1));
//     await controllers.Auth.register(generateEmailI(2), generatePasswordI(2));
//     // expect(controllers.Auth.getAllLoggedOutMembersIds().length).toEqual(2);
//     // expect(controllers.Auth.getAllLoggedInMembersIds().length).toEqual(0);
//     let allLoggedOutMembersIds =
//       await controllers.Auth.getAllLoggedOutMembersIds();
//     let allLoggedInMembersIds =
//       await controllers.Auth.getAllLoggedInMembersIds();
//     expect(allLoggedOutMembersIds.length).toEqual(2);
//     expect(allLoggedInMembersIds.length).toEqual(0);
//     const guestId = controllers.Auth.startSession();
//     await controllers.Auth.login(
//       guestId,
//       generateEmailI(1),
//       generatePasswordI(1)
//     );
//     // expect(controllers.Auth.getAllLoggedOutMembersIds().length).toEqual(1);
//     // expect(controllers.Auth.getAllLoggedInMembersIds().length).toEqual(1);
//     allLoggedOutMembersIds = await controllers.Auth.getAllLoggedOutMembersIds();
//     allLoggedInMembersIds = await controllers.Auth.getAllLoggedInMembersIds();
//     expect(allLoggedOutMembersIds.length).toEqual(1);
//     expect(allLoggedInMembersIds.length).toEqual(1);
//   });
// });

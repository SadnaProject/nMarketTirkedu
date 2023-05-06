/* eslint-disable @typescript-eslint/no-empty-function */
import { beforeEach, describe, expect, vi } from "vitest";
import { type Repos, createMockRepos, createTestRepos } from "./_HasRepos";

import { itUnitIntegration } from "../_mock";
import {
  createMockControllers,
  createTestControllers,
} from "../_createControllers";
import { type Controllers } from "../_HasController";
import { get } from "http";
import { GuestUserAuth } from "../Auth/GuestUserAuth";
import { MemberUserAuth } from "../Auth/MemberUserAuth";

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
function generateEmailI(i: number): string {
  return "user" + i.toString() + "@email.com";
}
function generatePasswordI(i: number): string {
  return "password" + i.toString();
}
beforeEach(() => {
  repos = createMockRepos();
  controllers = createMockControllers("Jobs");
});
describe("InitializeStore", () => {
  itUnitIntegration("✅InitializeStore", (testType) => {
    controllers = createTestControllers(testType, "Jobs");
    repos = createTestRepos(testType);
    controllers.Jobs.initRepos(repos);
    const storeId = "store1";
    const founderId = "founder1";
    expect(() => controllers.Jobs.getStoreFounderId(storeId)).toThrow();
    expect(() =>
      controllers.Jobs.InitializeStore(storeId, founderId)
    ).not.toThrow();
    expect(controllers.Jobs.getStoreFounderId(storeId)).toEqual(founderId);
  });
});

// describe("starts session", () => {
//   itUnitIntegration("✅starts session", (testType) => {
//     repos = createTestRepos(testType);
//     controllers.Auth.initRepos(repos);
//     vi.spyOn(repos.Users, "doesMemberExistById").mockReturnValue(false);
//     vi.spyOn(repos.Users, "getGuestById").mockReturnValue(getGuestI(1));
//     vi.spyOn(repos.Users, "addGuest").mockImplementation(() => {});
//     vi.spyOn(repos.Users, "doesMemberExistById").mockReturnValue(false);
//     vi.spyOn(GuestUserAuth, "create").mockImplementation(() => {
//       const guest = new GuestUserAuth();
//       // vi.spyOn(guest, "isConnectionValid").mockReturnValue(true);
//       return guest;
//     });
//     vi.spyOn(GuestUserAuth.prototype, "isConnectionValid").mockReturnValue(
//       true
//     );
//     let guestId = "";
//     expect(() => (guestId = controllers.Auth.startSession())).not.toThrow();
//     vi.spyOn(repos.Users, "doesGuestExistById").mockReturnValue(true);
//     expect(guestId).not.toEqual("");
//     expect(controllers.Auth.isGuest(guestId)).toEqual(true);
//     expect(controllers.Auth.isMember(guestId)).toEqual(false);
//     expect(controllers.Auth.isConnected(guestId)).toEqual(true);
//   });
// });

import { faker } from "@faker-js/faker/locale/en";
import { generateStoreName } from "server/domain/Stores/_data";
import { Service } from "server/service/Service";
import { beforeEach } from "vitest";
import { describe, expect, it } from "vitest";

let service: Service;
beforeEach(() => {
  service = new Service();
});
//fix after logout is implemented
describe("Member Logout", () => {
  it("✅ Logout of a logged in member", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const nid = service.logoutMember(uid);
    expect(service.isConnected(nid) && service.isGuest(nid)).toBe(true);
  });
});

describe("create a new store", () => {
  it("✅creates a store", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    expect(service.isStoreFounder(uid, storeId)).toBe(true);
  });
  it("❎user is not a member", () => {
    const id = service.startSession();
    const storeName = generateStoreName();
    expect(() => service.createStore(id, storeName)).toThrow();
  });
});

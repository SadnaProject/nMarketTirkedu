import { faker } from "@faker-js/faker/locale/en";
import { generateStoreName } from "server/data/Stores/helpers/_data";
import { Service } from "server/service/Service";
import { beforeEach } from "vitest";
import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

let service: Service;
beforeEach(() => {
  service = new Service();
});
//Use Case 3.1
describe("Member Logout", () => {
  it("✅ Logout of a logged in member", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const nid = await service.logoutMember(uid);
    expect((await service.isConnected(nid)) && service.isGuest(nid)).toBe(true);
  });
});
//Use Case 3.2
describe("create a new store", () => {
  it("✅creates a store", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    expect(await service.isStoreFounder(uid, storeId)).toBe(true);
  });
  it("❎user is not a member", async () => {
    const id = await service.startSession();
    const storeName = generateStoreName();
    expect(() => service.createStore(id, storeName)).toThrow(TRPCError);
    //this store should not be added, so the following code has to work
    const email = faker.internet.email();
    const password = faker.internet.password();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeId = await service.createStore(uid, storeName);
    expect(await service.isStoreFounder(uid, storeId)).toBe(true);
  });
});

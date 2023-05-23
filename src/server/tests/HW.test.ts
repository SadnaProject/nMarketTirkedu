import { faker } from "@faker-js/faker/locale/en";
import {
  generateProductArgs,
  generateStoreName,
} from "server/domain/Stores/_data";
import { Service } from "server/service/Service";
import { describe, expect, it, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

let service: Service;
beforeEach(() => {
  service = new Service();
});
//Use Cases 4.4 + 4.5, Homework Scenario
/**
 * Users: u1, u2, u3.
u1 is founder of store s1.
u1 appoint u2 as s1 store owner.
u2 appoint u3 as s1 store owner.
u3 tries to remove u2 – expected failure.
u1 removes u2 – expected success.
Expected results: u3 is removed.
 */
describe("Homework Scenario", () => {
  let email: string,
    password: string,
    id: string,
    u1: string,
    storeName: string,
    storeId: string,
    ownermail: string,
    ownerpass: string,
    oid2: string,
    u2: string,
    owner3mail: string,
    owner3pass: string,
    oid3: string,
    u3: string;
  beforeEach(async () => {
    email = faker.internet.email();
    password = faker.internet.password();
    id = service.startSession();
    await service.registerMember(id, email, password);
    u1 = await service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(u1, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    oid2 = service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    u2 = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(u1, storeId, u2);
    owner3mail = "owner3@gmail.com";
    owner3pass = "owner123";
    oid3 = service.startSession();
    await service.registerMember(oid3, owner3mail, owner3pass);
    u3 = await service.loginMember(oid3, owner3mail, owner3pass);
    await service.makeStoreOwner(u2, storeId, u3);
  });
  it("u3 tries to remove u2 - should fail", async () => {
    expect(await service.removeStoreOwner(u3, storeId, u2)).toThrow(TRPCError);
    expect(await service.isStoreOwner(u2, storeId)).toBe(true);
  });
  it("u1 tries to remove u2 - should succeed and remove also u3", async () => {
    await service.removeStoreOwner(u1, storeId, u2);
    expect(await service.isStoreOwner(u2, storeId)).toBe(false);
    expect(await service.isStoreOwner(u3, storeId)).toBe(false);
  });
});

//Use Cases 6.2 + 6.6
/**
 * Homework Scenario 2: makes sure that after removing a member its data is removed in real-time
 */
describe("Remove Member", () => {
  it("Scenario 2", async () => {
    const id = service.startSession();
    const uid = await service.loginMember(id, "admin@gmail.com", "admin");
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    expect((await service.getAllLoggedInMembersIds(uid)).includes(oid)).toBe(
      true
    );
    service.removeMember(uid, oid);
    expect(await service.isMember(oid)).toBe(false);
    expect((await service.getAllLoggedInMembersIds(uid)).includes(oid)).toBe(
      false
    );
    expect((await service.getAllLoggedOutMembersIds(uid)).includes(oid)).toBe(
      false
    );
  });
});
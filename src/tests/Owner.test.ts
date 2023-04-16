import { faker } from "@faker-js/faker/locale/en";
import { throws } from "assert";
import { beforeEach } from "vitest";
import { describe, expect, it } from "vitest";
import { Service } from "~/ServiceLayer/Service";
import { generateStoreName } from "~/DomainLayer/Stores/Store.test";

let service: Service;
beforeEach(() => {
  service = new Service();
});

/*describe("Stock Management", () => {
  it("✅ Add product to a store", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    expect(service.isMember(uid) && service.isConnected(uid)).toBe(true);
  });
  it("❎ Login using wrong email", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    expect(() => service.loginMember(id, "", password)).toThrow();
  });
  it("❎ Login using wrong password", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    expect(() => service.loginMember(id, email, "")).toThrow();
  });
});
*/
describe("Owner Appointment", () => {
  it("✅ Successful owner appointment", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    expect(service.isStoreOwner(oid, storeId)).toBe(true);
  });
  it("❎ Appointing an already appointed store owner (concurrency)", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const owner2mail = "owner2@gmail.com";
    const owner2pass = "owner123";
    const oid22 = service.startSession();
    service.registerMember(oid22, owner2mail, owner2pass);
    const oid222 = service.loginMember(oid22, owner2mail, owner2pass);
    service.makeStoreOwner(uid, storeId, oid222);
    expect(() => service.makeStoreOwner(oid, storeId, oid222)).toThrow();
  });
});

describe("Manager Appointment", () => {
  it("✅ Successful manager appointment", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = service.startSession();
    service.registerMember(m2, managermail, managerpass);
    const mid = service.loginMember(m2, managermail, managerpass);
    service.makeStoreManager(oid, storeId, mid);
    expect(service.isStoreManager(mid, storeId)).toBe(true);
  });
  it("❎ appointing an already appointed manager", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = service.startSession();
    service.registerMember(m2, managermail, managerpass);
    const mid = service.loginMember(m2, managermail, managerpass);
    service.makeStoreManager(oid, storeId, mid);
    expect(() => service.makeStoreManager(oid, storeId, mid)).toThrow();
  });
  it("❎ Appointing store owner to be a manager", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const owner2mail = "owner2@gmail.com";
    const owner2pass = "owner123";
    const oid22 = service.startSession();
    service.registerMember(oid22, owner2mail, owner2pass);
    const oid222 = service.loginMember(oid22, owner2mail, owner2pass);
    service.makeStoreOwner(uid, storeId, oid222);
    expect(() => service.makeStoreManager(oid, storeId, oid222)).toThrow();
  });
});
describe("Store Inactivating", () => {
  it("✅ Successful Case", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = service.startSession();
    service.registerMember(m2, managermail, managerpass);
    const mid = service.loginMember(m2, managermail, managerpass);
    service.makeStoreManager(oid, storeId, mid);
    service.deactivateStore(uid, storeId);
    expect(
      !service.isStoreActive(storeId) &&
        service.getNotifications(oid).length != 0 &&
        service.getNotifications(mid).length != 0
    ).toBe(true);
  });
  it("❎ Double Inactivating", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    service.deactivateStore(uid, storeId);
    expect(() => service.deactivateStore(uid, storeId)).toThrow();
  });
});
describe("Update manager permissions", () => {
  it("✅ Successful case", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = service.startSession();
    service.registerMember(m2, managermail, managerpass);
    const mid = service.loginMember(m2, managermail, managerpass);
    service.makeStoreManager(oid, storeId, mid);
    expect(service.isStoreManager(mid, storeId)).toBe(true);
  });
  it("❎ appointing an already appointed manager", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = service.startSession();
    service.registerMember(m2, managermail, managerpass);
    const mid = service.loginMember(m2, managermail, managerpass);
    service.makeStoreManager(oid, storeId, mid);
    expect(() => service.makeStoreManager(oid, storeId, mid)).toThrow();
  });
  it("❎ Appointing store owner to be a manager", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const owner2mail = "owner2@gmail.com";
    const owner2pass = "owner123";
    const oid22 = service.startSession();
    service.registerMember(oid22, owner2mail, owner2pass);
    const oid222 = service.loginMember(oid22, owner2mail, owner2pass);
    service.makeStoreOwner(uid, storeId, oid222);
    expect(() => service.makeStoreManager(oid, storeId, oid222)).toThrow();
  });
});

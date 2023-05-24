import { faker } from "@faker-js/faker/locale/en";
import { TRPCError } from "@trpc/server";
import {
  generateProductArgs,
  generateStoreName,
} from "server/domain/Stores/_data";
import { Service } from "server/service/Service";
import { describe, expect, it, beforeEach } from "vitest";

let service: Service;
beforeEach(() => {
  service = new Service();
});
//Use Case 6.4
describe("Get Purchase History by a buyer", () => {
  it("✅ Applied by system admin", async () => {
    const id = service.startSession();
    const uid = await service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const pargs = generateProductArgs();
    pargs.quantity = 2;
    const pid = await service.createProduct(oid, storeId, pargs);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    service.addProductToCart(umid, pid, 1);
    const card = faker.finance.creditCardNumber();
    const cCard = { number: card };
    await service.purchaseCart(umid, cCard);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 3;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    service.addProductToCart(umid, pid2, 2);
    await service.purchaseCart(umid, cCard);
    const hist = await service.getPurchasesByUser(uid, umid);
    expect(
      hist.length === 2 &&
        hist.at(0)?.totalPrice === pargs.price &&
        hist.at(1)?.totalPrice === 2 * pargs2.price
    ).toBe(true);
  });
  it("❎Applied by non-system admin", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const memail = faker.internet.email();
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    expect(() => service.getPurchasesByUser(uid, umid)).toThrow(TRPCError);
  });
});
//Use Case 6.4
describe("Get Purchase History by a store", () => {
  it("✅ Applied by system admin", async () => {
    const id = service.startSession();
    const uid = await service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const pargs = generateProductArgs();
    pargs.quantity = 2;
    const pid = await service.createProduct(oid, storeId, pargs);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    service.addProductToCart(umid, pid, 1);
    const card = faker.finance.creditCardNumber();
    const cCard = { number: card };
    await service.purchaseCart(umid, cCard);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 3;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    service.addProductToCart(umid, pid2, 2);
    await service.purchaseCart(umid, cCard);
    const hist = await service.getPurchasesByStore(uid, storeId);
    expect(
      hist.length === 2 &&
        hist.at(0)?.price === pargs.price &&
        hist.at(1)?.price === 2 * pargs2.price
    ).toBe(true);
  });
});
//Use Case 6.2
describe("Remove Member", () => {
  it("✅ Applied by system admin on regular member", async () => {
    const id = service.startSession();
    const uid = await service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    service.removeMember(uid, oid);
    expect(await service.isMember(oid)).toBe(false);
  });
  it("❎ Applied by system admin on store owner", async () => {
    const id = service.startSession();
    const uid = await service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    expect(() => service.removeMember(uid, oid)).toThrow(TRPCError);
    expect(await service.isMember(oid)).toBe(true);
  });
  it("❎ Applied by system admin on store manager", async () => {
    const id = service.startSession();
    const uid = await service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreManager(uid, storeId, oid);
    expect(() => service.removeMember(uid, oid)).toThrow(TRPCError);
    expect(await service.isMember(oid)).toBe(true);
  });
  it("❎Applied by non-system admin", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const memail = faker.internet.email();
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    expect(() => service.removeMember(uid, umid)).toThrow(TRPCError);
    expect(await service.isMember(umid)).toBe(true);
  });
  it("❎ Applied by system admin on a guest", async () => {
    const id = service.startSession();
    const uid = await service.loginMember(id, "admin@gmail.com", "admin");
    const oid2 = service.startSession();
    expect(() => service.removeMember(uid, oid2)).toThrow(TRPCError);
  });
});
//Use Case 6.6
describe("Get information about members", () => {
  it("✅ Logged in members and Logged out members", async () => {
    const id = service.startSession();
    const uid = await service.loginMember(id, "admin@gmail.com", "admin");
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    expect(
      (await service.getAllLoggedInMembersIds(uid)).length === 2 &&
        (await service.getAllLoggedInMembersIds(uid)).includes(uid) &&
        (await service.getAllLoggedInMembersIds(uid)).includes(oid)
    ).toBe(true);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    await service.logoutMember(umid);
    const memail2 = "member2@gmail.com";
    const mpassword2 = faker.internet.password();
    const mid2 = service.startSession();
    await service.registerMember(mid2, memail2, mpassword2);
    const umid2 = await service.loginMember(mid2, memail2, mpassword2);
    await service.logoutMember(umid2);
    // expect(
    //   service.getAllLoggedOutMembersIds(uid).length === 2 &&
    //     service.getAllLoggedOutMembersIds(uid).includes(umid) &&
    //     service.getAllLoggedOutMembersIds(uid).includes(umid2)
    // ).toBe(true);
  });
});

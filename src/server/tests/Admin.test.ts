import { faker } from "@faker-js/faker/locale/en";
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
  it("✅ Applied by system admin", () => {
    const id = service.startSession();
    const uid = service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const pargs = generateProductArgs();
    pargs.quantity = 2;
    const pid = service.createProduct(oid, storeId, pargs);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    service.registerMember(mid, memail, mpassword);
    const umid = service.loginMember(mid, memail, mpassword);
    service.addProductToCart(umid, pid, 1);
    const card = faker.finance.creditCardNumber();
    const cCard = { number: card };
    service.purchaseCart(umid, cCard);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 3;
    const pid2 = service.createProduct(oid, storeId, pargs2);
    service.addProductToCart(umid, pid2, 2);
    service.purchaseCart(umid, cCard);
    const hist = service.getPurchasesByUser(uid, umid);
    expect(
      hist.length == 2 &&
        hist.at(0)?.totalPrice == pargs.price &&
        hist.at(1)?.totalPrice == 2 * pargs2.price
    ).toBe(true);
  });
  it("❎Applied by non-system admin", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const memail = faker.internet.email();
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    service.registerMember(mid, memail, mpassword);
    const umid = service.loginMember(mid, memail, mpassword);
    expect(() => service.getPurchasesByUser(uid, umid)).toThrow();
  });
});
//Use Case 6.4
describe("Get Purchase History by a store", () => {
  it("✅ Applied by system admin", () => {
    const id = service.startSession();
    const uid = service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    const pargs = generateProductArgs();
    pargs.quantity = 2;
    const pid = service.createProduct(oid, storeId, pargs);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    service.registerMember(mid, memail, mpassword);
    const umid = service.loginMember(mid, memail, mpassword);
    service.addProductToCart(umid, pid, 1);
    const card = faker.finance.creditCardNumber();
    const cCard = { number: card };
    service.purchaseCart(umid, cCard);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 3;
    const pid2 = service.createProduct(oid, storeId, pargs2);
    service.addProductToCart(umid, pid2, 2);
    service.purchaseCart(umid, cCard);
    const hist = service.getPurchasesByStore(uid, storeId);
    expect(
      hist.length == 2 &&
        hist.at(0)?.price == pargs.price &&
        hist.at(1)?.price == 2 * pargs2.price
    ).toBe(true);
  });
});
//Use Case 6.2
describe("Remove Member", () => {
  it("✅ Applied by system admin on regular member", () => {
    const id = service.startSession();
    const uid = service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.removeMember(uid, oid);
    expect(service.isMember(oid)).toBe(false);
  });
  it("❎ Applied by system admin on store owner", () => {
    const id = service.startSession();
    const uid = service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    expect(() => service.removeMember(uid, oid)).toThrow();
    expect(service.isMember(oid)).toBe(true);
  });
  it("❎ Applied by system admin on store manager", () => {
    const id = service.startSession();
    const uid = service.loginMember(id, "admin@gmail.com", "admin");
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreManager(uid, storeId, oid);
    expect(() => service.removeMember(uid, oid)).toThrow();
    expect(service.isMember(oid)).toBe(true);
  });
  it("❎Applied by non-system admin", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const memail = faker.internet.email();
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    service.registerMember(mid, memail, mpassword);
    const umid = service.loginMember(mid, memail, mpassword);
    expect(() => service.removeMember(uid, umid)).toThrow();
    expect(service.isMember(umid)).toBe(true);
  });
  it("❎ Applied by system admin on a guest", () => {
    const id = service.startSession();
    const uid = service.loginMember(id, "admin@gmail.com", "admin");
    const oid2 = service.startSession();
    expect(() => service.removeMember(uid, oid2)).toThrow();
  });
});
//Use Case 6.6
describe("Get information about members", () => {
  it("✅ Logged in members and Logged out members", () => {
    const id = service.startSession();
    const uid = service.loginMember(id, "admin@gmail.com", "admin");
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    expect(
      service.getAllLoggedInMembersIds(uid).length == 2 &&
        service.getAllLoggedInMembersIds(uid).includes(uid) &&
        service.getAllLoggedInMembersIds(uid).includes(oid)
    ).toBe(true);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = service.startSession();
    service.registerMember(mid, memail, mpassword);
    const umid = service.loginMember(mid, memail, mpassword);
    service.logoutMember(umid);
    const memail2 = "member2@gmail.com";
    const mpassword2 = faker.internet.password();
    const mid2 = service.startSession();
    service.registerMember(mid2, memail2, mpassword2);
    const umid2 = service.loginMember(mid2, memail2, mpassword2);
    service.logoutMember(umid2);
    expect(
      service.getAllLoggedOutMembersIds(uid).length == 2 &&
        service.getAllLoggedOutMembersIds(uid).includes(umid) &&
        service.getAllLoggedOutMembersIds(uid).includes(umid2)
    ).toBe(true);
  });
});

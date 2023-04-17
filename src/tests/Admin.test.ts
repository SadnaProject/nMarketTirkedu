import { faker } from "@faker-js/faker/locale/en";
import { beforeEach } from "vitest";
import { describe, expect, it } from "vitest";
import {
  generateProductArgs,
  generateStoreName,
} from "~/DomainLayer/Stores/data";
import { Service } from "~/ServiceLayer/Service";

let service: Service;
beforeEach(() => {
  service = new Service();
});

describe("Get Purchase History by a buyer", () => {
  it("✅ Applied by system admin", () => {
    const id = service.startSession();
    const uid = service.loginMember(id, "admin", "admin");
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
    service.purchaseCart(umid, card);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 3;
    const pid2 = service.createProduct(oid, storeId, pargs2);
    service.addProductToCart(umid, pid2, 2);
    service.purchaseCart(umid, card);
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
describe("Get Purchase History by a store", () => {
  it("✅ Applied by system admin", () => {
    const id = service.startSession();
    const uid = service.loginMember(id, "admin", "admin");
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
    service.purchaseCart(umid, card);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 3;
    const pid2 = service.createProduct(oid, storeId, pargs2);
    service.addProductToCart(umid, pid2, 2);
    service.purchaseCart(umid, card);
    const hist = service.getPurchasesByStore(uid, storeId);
    expect(
      hist.length == 2 &&
        hist.at(0)?.price == pargs.price &&
        hist.at(1)?.price == 2 * pargs2.price
    ).toBe(true);
  });
});

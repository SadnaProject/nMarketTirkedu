import { faker } from "@faker-js/faker/locale/en";
import { throws } from "assert";
import { beforeEach } from "vitest";
import { describe, expect, it } from "vitest";
import { Service } from "~/ServiceLayer/Service";
import { generateStoreName } from "~/DomainLayer/Stores/Store.test";
import {
  createProduct,
  generateProductArgs,
} from "~/DomainLayer/Stores/StoreProduct.test";

let service: Service;
beforeEach(() => {
  service = new Service();
});

describe("Stock Management", () => {
  it("✅ Add product to a store", () => {
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
    const pargs = generateProductArgs();
    const pid = service.createProduct(oid, storeId, pargs);
    expect(
      service.getProductPrice(pid) == pargs.price &&
        service.getStoreIdByProductId(pid) == storeId
    ).toBe(true);
  });
  it("❎ product creation - empty name", () => {
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
    const pargs = generateProductArgs();
    pargs.name = "";
    expect(() => service.createProduct(oid, storeId, pargs)).toThrow();
  });

  it("❎ product creation - gets negative quantity", () => {
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
    const pargs = generateProductArgs();
    pargs.quantity = -1;
    expect(() => service.createProduct(oid, storeId, pargs)).toThrow();
  });

  it("❎ product creation -gets negative price", () => {
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
    const pargs = generateProductArgs();
    pargs.price = -1;
    expect(() => service.createProduct(oid, storeId, pargs)).toThrow();
  });
  it("✅ Update Product Details", () => {
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
    const pargs = generateProductArgs();
    pargs.price = 16;
    const pid = service.createProduct(oid, storeId, pargs);
    service.setProductPrice(oid, pid, 17);
    expect(service.getProductPrice(pid) == 17).toBe(true);
  });
  it("✅ Decrease product quantity within range", () => {
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
    const pargs = generateProductArgs();
    pargs.quantity = 5;
    const pid = service.createProduct(oid, storeId, pargs);
    service.decreaseProductQuantity(pid, 4);
    expect(
      service.isProductQuantityInStock(pid, 1) &&
        !service.isProductQuantityInStock(pid, 2)
    ).toBe(true);
  });
  it("❎ Decrease product quantity exceeding range", () => {
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
    const pargs = generateProductArgs();
    pargs.quantity = 5;
    const pid = service.createProduct(oid, storeId, pargs);
    expect(() => service.decreaseProductQuantity(pid, 7)).toThrow();
  });
});

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

describe("Manager Firing", () => {
  it("✅ Successful manager firing", () => {
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
    service.removeStoreManager(oid, storeId, mid);
    expect(service.isStoreManager(mid, storeId)).toBe(false);
  });
  it("❎ firing a non-manager", () => {
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
    service.removeStoreManager(oid, storeId, mid);
    expect(() => service.removeStoreManager(oid, storeId, mid)).toThrow();
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
describe("Owner Firing", () => {
  it("✅ Successful owner firing", () => {
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
    service.removeStoreOwner(uid, storeId, oid);
    expect(service.isStoreOwner(oid, storeId)).toBe(false);
  });
  it("❎ firing a non-Owner", () => {
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
    expect(() => service.removeStoreOwner(oid, storeId, mid)).toThrow();
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
    const mmail = "mem@gmail.com";
    const mempass = "owner123";
    const mem2 = service.startSession();
    service.registerMember(mem2, mmail, mempass);
    const mmid = service.loginMember(mem2, mmail, mempass);
    service.deactivateStore(uid, storeId);
    expect(
      !service.isStoreActive(uid, storeId) &&
        service.getNotifications(oid).length != 0 &&
        service.getNotifications(mid).length != 0 &&
        service.getNotifications(mmid).length == 0
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
  it("✅ Adding permission", () => {
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
    service.setAddingProductToStorePermission(oid, storeId, mid, true);
    expect(service.canCreateProductInStore(mid, storeId)).toBe(true);
  });
  it("✅ Removing permission", () => {
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
    service.setAddingProductToStorePermission(oid, storeId, mid, true);
    service.setAddingProductToStorePermission(oid, storeId, mid, false);
    expect(service.canCreateProductInStore(mid, storeId)).toBe(false);
  });
});
describe("Get Purchase History by a store", () => {
  it("✅ Applied by a store owner", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    const uid = service.loginMember(id, email, password);
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
    const hist = service.getPurchasesByStore(oid, storeId);
    expect(
      hist.length == 2 &&
        hist.at(0)?.totalPrice == pargs.price &&
        hist.at(1)?.totalPrice == 2 * pargs2.price &&
        hist.at(0)?.userId == umid &&
        hist.at(1)?.userId == umid
    ).toBe(true);
  });
  it("❎ Applied by a regular member", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    const uid = service.loginMember(id, email, password);
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
    expect(() => service.getPurchasesByStore(umid, storeId)).toThrow();
  });
  it("❎ Applied on non existing store", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    const oid = service.loginMember(oid2, ownermail, ownerpass);
    expect(() => service.getPurchasesByStore(oid, storeId)).toThrow();
  });
});
it("✅ Applied by a founder", () => {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const id = service.startSession();
  const uid = service.loginMember(id, email, password);
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
      hist.at(0)?.totalPrice == pargs.price &&
      hist.at(1)?.totalPrice == 2 * pargs2.price &&
      hist.at(0)?.userId == umid &&
      hist.at(1)?.userId == umid
  ).toBe(true);
});
/*
describe("Get details/permissions of role holders", () => {
  it("✅ Adding permission", () => {
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
    service.setAddingProductToStorePermission(oid, storeId, mid, true);
    expect(service.canCreateProductInStore(mid, storeId)).toBe(true);
  });
  it("✅ Removing permission", () => {
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
    service.setAddingProductToStorePermission(oid, storeId, mid, true);
    service.setAddingProductToStorePermission(oid, storeId, mid, false);
    expect(service.canCreateProductInStore(mid, storeId)).toBe(false);
  });
});
*/

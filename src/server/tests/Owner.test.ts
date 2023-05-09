import { faker } from "@faker-js/faker/locale/en";
import {
  generateProductArgs,
  generateStoreName,
} from "server/domain/Stores/_data";
import { Service } from "server/service/Service";
import { describe, expect, it, beforeEach, beforeAll } from "vitest";

let service: Service;
beforeEach(() => {
  service = new Service();
});
//Use Case 4.1
describe("Stock Management", () => {
  let email: string,
    password: string,
    id: string,
    uid: string,
    storeName: string,
    storeId: string,
    ownermail: string,
    ownerpass: string,
    oid: string,
    oid2: string,
    pargs: {
      name: string;
      quantity: number;
      price: number;
      category: string;
      description: string;
    };
  beforeEach(() => {
    service = new Service();
    email = faker.internet.email();
    password = faker.internet.password();
    id = service.startSession();
    service.registerMember(id, email, password);
    uid = service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = service.createStore(uid, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    pargs = generateProductArgs();
  });
  it("✅ Add product to a store", () => {
    const pid = service.createProduct(oid, storeId, pargs);
    expect(
      service.getProductPrice(uid, pid) == pargs.price &&
        service.getStoreIdByProductId(uid, pid) == storeId
    ).toBe(true);
  });
  it("❎ product creation - empty name", () => {
    pargs.name = "";
    expect(() => service.createProduct(oid, storeId, pargs)).toThrow();
    const res = service.searchProducts(uid, {
      name: pargs.name.toUpperCase().split(" ")[0],
    });
    expect(res.keys.length == 0).toBe(true);
  });

  it("❎ product creation - gets negative quantity", () => {
    pargs.quantity = -1;
    expect(() => service.createProduct(oid, storeId, pargs)).toThrow();
    const res = service.searchProducts(uid, {
      name: pargs.name.toUpperCase().split(" ")[0],
    });
    expect(res.keys.length == 0).toBe(true);
  });

  it("❎ product creation -gets negative price", () => {
    pargs.price = -1;
    expect(() => service.createProduct(oid, storeId, pargs)).toThrow();
    const res = service.searchProducts(uid, {
      name: pargs.name.toUpperCase().split(" ")[0],
    });
    expect(res.keys.length == 0).toBe(true);
  });
  it("✅ Update Product Details", () => {
    pargs.price = 16;
    const pid = service.createProduct(oid, storeId, pargs);
    service.setProductPrice(oid, pid, 17);
    expect(service.getProductPrice(oid, pid) == 17).toBe(true);
  });
  it("✅ Decrease product quantity within range", () => {
    pargs.quantity = 5;
    const pid = service.createProduct(oid, storeId, pargs);
    service.decreaseProductQuantity(pid, 4);
    expect(
      service.isProductQuantityInStock(oid, pid, 1) &&
        !service.isProductQuantityInStock(oid, pid, 2)
    ).toBe(true);
  });
  it("❎ Decrease product quantity exceeding range", () => {
    pargs.quantity = 5;
    const pid = service.createProduct(oid, storeId, pargs);
    expect(() => service.decreaseProductQuantity(pid, 7)).toThrow();
    expect(
      service.isProductQuantityInStock(uid, pid, 5) &&
        !service.isProductQuantityInStock(uid, pid, 6)
    ).toBe(true);
  });
});
//Use Case 4.4
describe("Owner Appointment", () => {
  let email: string,
    password: string,
    id: string,
    uid: string,
    storeName: string,
    storeId: string,
    ownermail: string,
    ownerpass: string,
    oid2: string,
    oid: string;
  beforeEach(() => {
    email = faker.internet.email();
    password = faker.internet.password();
    id = service.startSession();
    service.registerMember(id, email, password);
    uid = service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = service.createStore(uid, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
  });
  it("✅ Successful owner appointment", () => {
    expect(service.isStoreOwner(oid, storeId)).toBe(true);
  });
  it("❎ Appointing an already appointed store owner (concurrency)", () => {
    const owner2mail = "owner2@gmail.com";
    const owner2pass = "owner123";
    const oid22 = service.startSession();
    service.registerMember(oid22, owner2mail, owner2pass);
    const oid222 = service.loginMember(oid22, owner2mail, owner2pass);
    service.makeStoreOwner(uid, storeId, oid222);
    expect(() => service.makeStoreOwner(oid, storeId, oid222)).toThrow();
    expect(service.isStoreOwner(oid, storeId)).toBe(true);
  });
});
//Use Case 4.8
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
    expect(service.isStoreManager(mid, storeId)).toBe(false);
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
    expect(service.isStoreOwner(oid222, storeId)).toBe(true);
  });
});
//Use Case 4.7
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
//Use Case 4.6
describe("Manager Appointment", () => {
  let email: string,
    password: string,
    id: string,
    uid: string,
    storeName: string,
    storeId: string,
    ownermail: string,
    ownerpass: string,
    oid2: string,
    oid: string;
  beforeEach(() => {
    email = faker.internet.email();
    password = faker.internet.password();
    id = service.startSession();
    service.registerMember(id, email, password);
    uid = service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = service.createStore(uid, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
  });
  it("✅ Successful manager appointment", () => {
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = service.startSession();
    service.registerMember(m2, managermail, managerpass);
    const mid = service.loginMember(m2, managermail, managerpass);
    service.makeStoreManager(oid, storeId, mid);
    expect(service.isStoreManager(mid, storeId)).toBe(true);
  });
  it("❎ appointing an already appointed manager", () => {
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = service.startSession();
    service.registerMember(m2, managermail, managerpass);
    const mid = service.loginMember(m2, managermail, managerpass);
    service.makeStoreManager(oid, storeId, mid);
    expect(() => service.makeStoreManager(oid, storeId, mid)).toThrow();
    expect(service.isStoreManager(mid, storeId)).toBe(true);
  });
  it("❎ Appointing store owner to be a manager", () => {
    const owner2mail = "owner2@gmail.com";
    const owner2pass = "owner123";
    const oid22 = service.startSession();
    service.registerMember(oid22, owner2mail, owner2pass);
    const oid222 = service.loginMember(oid22, owner2mail, owner2pass);
    service.makeStoreOwner(uid, storeId, oid222);
    expect(() => service.makeStoreManager(oid, storeId, oid222)).toThrow();
    expect(service.isStoreOwner(oid222, storeId)).toBe(true);
    expect(service.isStoreManager(oid222, storeId)).toBe(false);
  });
});
//Use Case 4.9
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
    expect(() => service.isStoreActive(uid, storeId)).toBe(false);
  });
});
//Use Case 4.7
describe("Update manager permissions", () => {
  let email: string,
    password: string,
    id: string,
    uid: string,
    storeName: string,
    storeId: string,
    ownermail: string,
    ownerpass: string,
    oid2: string,
    oid: string,
    managermail: string,
    managerpass: string,
    m2: string,
    mid: string;
  beforeEach(() => {
    email = faker.internet.email();
    password = faker.internet.password();
    id = service.startSession();
    service.registerMember(id, email, password);
    uid = service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = service.createStore(uid, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    oid2 = service.startSession();
    service.registerMember(oid2, ownermail, ownerpass);
    oid = service.loginMember(oid2, ownermail, ownerpass);
    service.makeStoreOwner(uid, storeId, oid);
    managermail = "manager@gmail.com";
    managerpass = "owner123";
    m2 = service.startSession();
    service.registerMember(m2, managermail, managerpass);
    mid = service.loginMember(m2, managermail, managerpass);
    service.makeStoreManager(oid, storeId, mid);
    service.setAddingProductToStorePermission(oid, storeId, mid, true);
  });
  it("✅ Adding permission", () => {
    expect(service.canCreateProductInStore(mid, storeId)).toBe(true);
  });
  it("✅ Removing permission", () => {
    service.setAddingProductToStorePermission(oid, storeId, mid, false);
    expect(service.canCreateProductInStore(mid, storeId)).toBe(false);
  });
});
//Use Case 4.13
describe("Get Purchase History by a store", () => {
  it("✅ Applied by a store owner", () => {
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
    const hist = service.getPurchasesByStore(oid, storeId);
    expect(
      hist.length == 2 &&
        hist.at(0)?.price == pargs.price &&
        hist.at(1)?.price == 2 * pargs2.price &&
        hist.at(0)?.storeId == storeId &&
        hist.at(1)?.storeId == storeId
    ).toBe(true);
  });
  it("❎ Applied by a regular member", () => {
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
    expect(() => service.getPurchasesByStore(umid, storeId)).toThrow();
  });
  it("❎ Applied on non existing store", () => {
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
    expect(() => service.getPurchasesByStore(oid, storeId)).toThrow();
  });
});
it("✅ Applied by a founder", () => {
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
      hist.at(1)?.price == 2 * pargs2.price &&
      hist.at(0)?.storeId == storeId &&
      hist.at(1)?.storeId == storeId
  ).toBe(true);
});
//Use Case 4.11
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

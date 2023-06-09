import { faker } from "@faker-js/faker/locale/en";
import {
  generateProductArgs,
  generateStoreName,
} from "server/data/Stores/helpers/_data";
import { Service } from "server/service/Service";
import { describe, expect, it, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { resetDB } from "server/helpers/_Transactional";
import { type ConditionArgs } from "server/domain/Stores/Conditions/CompositeLogicalCondition/Condition";
import { ZodError } from "zod";
import exp from "constants";
let service: Service;
// const service = new Service();

export type PaymentDetails = {
  number: string;
  month: string;
  year: string;
  holder: string;
  ccv: string;
  id: string;
};
export type DeliveryDetails = {
  name: string;
  address: string;
  city: string;
  country: string;
  zip: string;
};

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
  beforeEach(async () => {
    await resetDB();
    service = new Service();
    email = faker.internet.email();
    password = faker.internet.password();
    id = await service.startSession();
    await service.registerMember(id, email, password);
    uid = await service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(uid, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    pargs = generateProductArgs();
  });
  it("✅ Add product to a store", async () => {
    const pid = await service.createProduct(oid, storeId, pargs);
    expect(
      (await service.getProductPrice(uid, pid)) === pargs.price &&
        (await service.getStoreIdByProductId(uid, pid)) === storeId
    ).toBe(true);
  });
  it("❎ product creation - empty name", async () => {
    pargs.name = "";
    await expect(() =>
      service.createProduct(oid, storeId, pargs)
    ).rejects.toThrow("Name must be nonempty");
    const res = await service.searchProducts(uid, {
      name: pargs.name.toUpperCase().split(" ")[0],
    });
    expect(res.keys.length === 0).toBe(true);
  });

  it("❎ product creation - gets negative quantity", async () => {
    pargs.quantity = -1;
    await expect(() =>
      service.createProduct(oid, storeId, pargs)
    ).rejects.toThrow(); //this currently throws a zod error, i cant check it. change it to throw a trpc error
    const res = await service.searchProducts(uid, {
      name: pargs.name.toUpperCase().split(" ")[0],
    });
    expect(res.keys.length === 0).toBe(true);
  });

  it("❎ product creation -gets negative price", async () => {
    pargs.price = -1;
    await expect(() =>
      service.createProduct(oid, storeId, pargs)
    ).rejects.toThrow(); //this currently throws a zod error, i cant check it. change it to throw a trpc error
    const res = await service.searchProducts(uid, {
      name: pargs.name.toUpperCase().split(" ")[0],
    });
    expect(res.keys.length === 0).toBe(true);
  });
  it("✅ Update Product Details", async () => {
    pargs.price = 16;
    const pid = await service.createProduct(oid, storeId, pargs);
    await service.setProductPrice(oid, pid, 17);
    expect((await service.getProductPrice(oid, pid)) === 17).toBe(true);
  });
  it("✅ Decrease product quantity within range", async () => {
    pargs.quantity = 5;
    const pid = await service.createProduct(oid, storeId, pargs);
    await service.decreaseProductQuantity(pid, 4);
    expect(
      (await service.isProductQuantityInStock(oid, pid, 1)) &&
        !(await service.isProductQuantityInStock(oid, pid, 2))
    ).toBe(true);
  });
  it("❎ Decrease product quantity exceeding range", async () => {
    pargs.quantity = 5;
    const pid = await service.createProduct(oid, storeId, pargs);
    await expect(() => service.decreaseProductQuantity(pid, 7)).rejects.toThrow(
      TRPCError
    );
    expect(
      (await service.isProductQuantityInStock(uid, pid, 5)) &&
        !(await service.isProductQuantityInStock(uid, pid, 6))
    ).toBe(true);
  });
});
//Use Case 4.1-Manager
describe("Stock Management", () => {
  let email: string,
    password: string,
    id: string,
    founderId: string,
    storeName: string,
    storeId: string,
    managerMail: string,
    managerPass: string,
    managerId: string,
    // oid2: string,

    pargs: {
      name: string;
      quantity: number;
      price: number;
      category: string;
      description: string;
    };
  beforeEach(async () => {
    await resetDB();
    service = new Service();
    email = faker.internet.email();
    password = faker.internet.password();
    id = await service.startSession();
    await service.registerMember(id, email, password);
    founderId = await service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(founderId, storeName);
    managerMail = "owner@gmail.com";
    managerPass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, managerMail, managerPass);
    managerId = await service.loginMember(oid2, managerMail, managerPass);
    await service.makeStoreManager(founderId, storeId, managerId);
    pargs = generateProductArgs();
  });
  it("✅ Add product to a store", async () => {
    await service.setAddingProductToStorePermission(
      founderId,
      storeId,
      managerId,
      true
    );
    const pid = await service.createProduct(managerId, storeId, pargs);
    expect(
      (await service.getProductPrice(founderId, pid)) === pargs.price &&
        (await service.getStoreIdByProductId(founderId, pid)) === storeId
    ).toBe(true);
  });
  it("❎ Add product to a store - manager doesnt have permission", async () => {
    await expect(() =>
      service.createProduct(managerId, storeId, pargs)
    ).rejects.toThrow(
      "User does not have permission to create product in store"
    );
  });

  it("✅ Update Product Details", async () => {
    pargs.price = 16;
    const pid = await service.createProduct(founderId, storeId, pargs);
    await service.setEditingProductInStorePermission(
      founderId,
      storeId,
      managerId,
      true
    );
    await service.setProductPrice(managerId, pid, 17);
    expect((await service.getProductPrice(managerId, pid)) === 17).toBe(true);
  });
  it("❎ Update Product Details - manager doesnt have permission", async () => {
    pargs.price = 16;
    const pid = await service.createProduct(founderId, storeId, pargs);
    await expect(() =>
      service.setProductPrice(managerId, pid, 17)
    ).rejects.toThrow("User does not have permission to edit product");
    expect((await service.getProductPrice(managerId, pid)) === 16).toBe(true);
  });
  //delete product
  it("✅ Delete Product", async () => {
    const pid = await service.createProduct(founderId, storeId, pargs);
    await service.setRemovingProductFromStorePermission(
      founderId,
      storeId,
      managerId,
      true
    );
    await service.deleteProduct(managerId, pid);
    expect(
      (await service.getStoreProducts(founderId, storeId)).length === 0
    ).toBe(true);
  });
  it("❎ Delete Product - manager doesnt have permission", async () => {
    const pid = await service.createProduct(founderId, storeId, pargs);
    await expect(() => service.deleteProduct(managerId, pid)).rejects.toThrow(
      "User does not have permission to delete product"
    );
    expect(
      (await service.getStoreProducts(founderId, storeId)).length === 1
    ).toBe(true);
  });
});
// Use Case 4.4
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
  beforeEach(async () => {
    await resetDB();
    service = new Service();
    email = faker.internet.email();
    password = faker.internet.password();
    id = await service.startSession();
    await service.registerMember(id, email, password);
    uid = await service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(uid, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
  });
  it("✅ Successful owner appointment", async () => {
    expect(await service.isStoreOwner(oid, storeId)).toBe(true);
  });
  it("❎ Appointing an already appointed store owner (concurrency)", async () => {
    const owner2mail = "owner2@gmail.com";
    const owner2pass = "owner123";
    const oid22 = await service.startSession();
    await service.registerMember(oid22, owner2mail, owner2pass);
    const oid222 = await service.loginMember(oid22, owner2mail, owner2pass);
    const makeOwnerObjectId = await service.makeStoreOwner(
      uid,
      storeId,
      oid222
    );
    await expect(service.isStoreOwner(oid222, storeId)).resolves.toBe(false);
    await service.approveStoreOwner(makeOwnerObjectId, oid);
    await expect(service.isStoreOwner(oid222, storeId)).resolves.toBe(true);
    await expect(() =>
      service.makeStoreOwner(oid, storeId, oid222)
    ).rejects.toThrow(TRPCError);
    expect(await service.isStoreOwner(oid, storeId)).toBe(true);
  });
});

// Use Case 4.8
describe("Manager Firing", () => {
  beforeEach(async () => {
    await resetDB();
    service = new Service();
  });
  it("✅ Successful manager firing", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = await service.startSession();
    await service.registerMember(m2, managermail, managerpass);
    const mid = await service.loginMember(m2, managermail, managerpass);
    await service.makeStoreManager(oid, storeId, mid);
    await service.removeStoreManager(oid, storeId, mid);
    expect(await service.isStoreManager(mid, storeId)).toBe(false);
  });
  it("❎ firing a non-manager", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = await service.startSession();
    await service.registerMember(m2, managermail, managerpass);
    const mid = await service.loginMember(m2, managermail, managerpass);
    await service.makeStoreManager(oid, storeId, mid);
    await service.removeStoreManager(oid, storeId, mid);
    await expect(() =>
      service.removeStoreManager(oid, storeId, mid)
    ).rejects.toThrow(
      "The user requested to be removed is not a store manager"
    );
    expect(await service.isStoreManager(mid, storeId)).toBe(false);
  });
  it("❎ Appointing store owner to be a manager", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const founderId = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(founderId, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(founderId, storeId, oid);
    const owner2mail = "owner2@gmail.com";
    const owner2pass = "owner123";
    const oid22 = await service.startSession();
    await service.registerMember(oid22, owner2mail, owner2pass);
    const oid222 = await service.loginMember(oid22, owner2mail, owner2pass);
    const makeOwnerObjectId = await service.makeStoreOwner(
      founderId,
      storeId,
      oid222
    );
    await service.approveStoreOwner(makeOwnerObjectId, oid);
    await expect(service.isStoreOwner(oid222, storeId)).resolves.toBe(true);
    await expect(() =>
      service.makeStoreManager(oid, storeId, oid222)
    ).rejects.toThrow(
      "This user cannot be appointed as he is already a position holder in this store"
    );
    expect(await service.isStoreOwner(oid222, storeId)).toBe(true);
  });
});
//Use Case 4.7
describe("Owner Firing", () => {
  beforeEach(async () => {
    await resetDB();
    service = new Service();
  });
  it("✅ Successful owner firing", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    await service.removeStoreOwner(uid, storeId, oid);
    expect(await service.isStoreOwner(oid, storeId)).toBe(false);
  });
  it("❎ firing a non-Owner", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = await service.startSession();
    await service.registerMember(m2, managermail, managerpass);
    const mid = await service.loginMember(m2, managermail, managerpass);
    await service.makeStoreManager(oid, storeId, mid);
    await expect(() =>
      service.removeStoreOwner(oid, storeId, mid)
    ).rejects.toThrow("The user requested to be removed is not a store owner");
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
  beforeEach(async () => {
    await resetDB();
    service = new Service();
    email = faker.internet.email();
    password = faker.internet.password();
    id = await service.startSession();
    await service.registerMember(id, email, password);
    uid = await service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(uid, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
  });
  it("✅ Successful manager appointment", async () => {
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = await service.startSession();
    await service.registerMember(m2, managermail, managerpass);
    const mid = await service.loginMember(m2, managermail, managerpass);
    await service.makeStoreManager(oid, storeId, mid);
    expect(await service.isStoreManager(mid, storeId)).toBe(true);
  });
  it("❎ appointing an already appointed manager", async () => {
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = await service.startSession();
    await service.registerMember(m2, managermail, managerpass);
    const mid = await service.loginMember(m2, managermail, managerpass);
    await service.makeStoreManager(oid, storeId, mid);
    await expect(() =>
      service.makeStoreManager(oid, storeId, mid)
    ).rejects.toThrow(TRPCError);
    expect(await service.isStoreManager(mid, storeId)).toBe(true);
  });
  it("❎ Appointing store owner to be a manager", async () => {
    const owner2mail = "owner2@gmail.com";
    const owner2pass = "owner123";
    const oid22 = await service.startSession();
    await service.registerMember(oid22, owner2mail, owner2pass);
    const oid222 = await service.loginMember(oid22, owner2mail, owner2pass);
    const makeOwnerObjectId = await service.makeStoreOwner(
      uid,
      storeId,
      oid222
    );
    await service.approveStoreOwner(makeOwnerObjectId, oid);
    await expect(() =>
      service.makeStoreManager(oid, storeId, oid222)
    ).rejects.toThrow(TRPCError);
    expect(await service.isStoreOwner(oid222, storeId)).toBe(true);
    expect(await service.isStoreManager(oid222, storeId)).toBe(false);
  });
});
//Use Case 4.9
describe("Store Inactivating", () => {
  beforeEach(async () => {
    await resetDB();
    service = new Service();
  });
  it("✅ Successful Case", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = await service.startSession();
    await service.registerMember(m2, managermail, managerpass);
    const mid = await service.loginMember(m2, managermail, managerpass);
    await service.makeStoreManager(oid, storeId, mid);
    const mmail = "mem@gmail.com";
    const mempass = "owner123";
    const mem2 = await service.startSession();
    await service.registerMember(mem2, mmail, mempass);
    const mmid = await service.loginMember(mem2, mmail, mempass);
    await service.deactivateStore(uid, storeId);
    expect(
      !(await service.isStoreActive(uid, storeId)) &&
        (await service.getNotifications(oid)).length !== 0 &&
        (await service.getNotifications(mid)).length !== 0 &&
        (await service.getNotifications(mmid)).length === 0
    ).toBe(true);
  });
  it("❎ Double Inactivating", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    await service.deactivateStore(uid, storeId);
    await expect(() => service.deactivateStore(uid, storeId)).rejects.toThrow(
      TRPCError
    );
    expect(await service.isStoreActive(uid, storeId)).toBe(false);
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
  beforeEach(async () => {
    await resetDB();
    service = new Service();
    email = faker.internet.email();
    password = faker.internet.password();
    id = await service.startSession();
    await service.registerMember(id, email, password);
    uid = await service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(uid, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    managermail = "manager@gmail.com";
    managerpass = "owner123";
    m2 = await service.startSession();
    await service.registerMember(m2, managermail, managerpass);
    mid = await service.loginMember(m2, managermail, managerpass);
    await service.makeStoreManager(oid, storeId, mid);
    await service.setAddingProductToStorePermission(oid, storeId, mid, true);
  });
  it("✅ Adding permission", async () => {
    expect(await service.canCreateProductInStore(mid, storeId)).toBe(true);
  });
  it("✅ Removing permission", async () => {
    await service.setAddingProductToStorePermission(oid, storeId, mid, false);
    expect(await service.canCreateProductInStore(mid, storeId)).toBe(false);
  });
});
//Use Case 4.13
describe("Get Purchase History by a store", () => {
  beforeEach(async () => {
    await resetDB();
    service = new Service();
  });
  it("✅ Applied by a store owner", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const pargs = generateProductArgs();
    pargs.quantity = 2;
    const pid = await service.createProduct(oid, storeId, pargs);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    await service.addProductToCart(umid, pid, 1);
    const card = faker.finance.creditCardNumber();
    const cCard: PaymentDetails = {
      number: card,
      ccv: "144",
      holder: "Buya",
      id: "111111111",
      month: "3",
      year: "2025",
    };
    const d: DeliveryDetails = {
      address: "dsadas",
      city: "asdasd",
      country: "sadasd",
      name: "bsajsa",
      zip: "2143145",
    };
    await service.purchaseCart(umid, cCard, d);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 3;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    await service.addProductToCart(umid, pid2, 2);
    await service.purchaseCart(umid, cCard, d);
    const hist = await service.getPurchasesByStore(oid, storeId);
    expect(
      hist.length === 2 &&
        hist.at(0)?.price === pargs.price &&
        hist.at(1)?.price === 2 * pargs2.price &&
        hist.at(0)?.storeId === storeId &&
        hist.at(1)?.storeId === storeId
    ).toBe(true);
  });
  it("❎ Applied by a regular member", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const pargs = generateProductArgs();
    pargs.quantity = 2;
    const pid = await service.createProduct(oid, storeId, pargs);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    await service.addProductToCart(umid, pid, 1);
    const card = faker.finance.creditCardNumber();
    const cCard: PaymentDetails = {
      number: card,
      ccv: "144",
      holder: "Buya",
      id: "111111111",
      month: "3",
      year: "2025",
    };
    const d: DeliveryDetails = {
      address: "dsadas",
      city: "asdasd",
      country: "sadasd",
      name: "bsajsa",
      zip: "2143145",
    };
    await service.purchaseCart(umid, cCard, d);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 3;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    await service.addProductToCart(umid, pid2, 2);
    await service.purchaseCart(umid, cCard, d);
    await expect(() =>
      service.getPurchasesByStore(umid, storeId)
    ).rejects.toThrow(TRPCError);
  });
  it("❎ Applied on non existing store", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await expect(() =>
      service.getPurchasesByStore(oid, storeId)
    ).rejects.toThrow(
      "User does not have permission to receive purchase history from store"
    );
  });
  // });
  it("✅ Applied by a founder", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const pargs = generateProductArgs();
    pargs.quantity = 2;
    const pid = await service.createProduct(oid, storeId, pargs);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    await service.addProductToCart(umid, pid, 1);
    const card = faker.finance.creditCardNumber();
    const cCard: PaymentDetails = {
      number: card,
      ccv: "144",
      holder: "Buya",
      id: "111111111",
      month: "3",
      year: "2025",
    };
    const d: DeliveryDetails = {
      address: "dsadas",
      city: "asdasd",
      country: "sadasd",
      name: "bsajsa",
      zip: "2143145",
    };
    await service.purchaseCart(umid, cCard, d);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 3;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    await service.addProductToCart(umid, pid2, 2);
    await service.purchaseCart(umid, cCard, d);
    const hist = await service.getPurchasesByStore(uid, storeId);
    expect(
      hist.length === 2 &&
        hist.at(0)?.price === pargs.price &&
        hist.at(1)?.price === 2 * pargs2.price &&
        hist.at(0)?.storeId === storeId &&
        hist.at(1)?.storeId === storeId
    ).toBe(true);
  });
});
//Use Case 4.11
describe("Get details/permissions of role holders", () => {
  beforeEach(async () => {
    await resetDB();
    service = new Service();
  });
  it("✅ Adding permission", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = await service.startSession();
    await service.registerMember(m2, managermail, managerpass);
    const mid = await service.loginMember(m2, managermail, managerpass);
    await service.makeStoreManager(oid, storeId, mid);
    await service.setAddingProductToStorePermission(oid, storeId, mid, true);
    expect(await service.canCreateProductInStore(mid, storeId)).toBe(true);
  });
  it("✅ Removing permission", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const managermail = "manager@gmail.com";
    const managerpass = "owner123";
    const m2 = await service.startSession();
    await service.registerMember(m2, managermail, managerpass);
    const mid = await service.loginMember(m2, managermail, managerpass);
    await service.makeStoreManager(oid, storeId, mid);
    await service.setAddingProductToStorePermission(oid, storeId, mid, true);
    await service.setAddingProductToStorePermission(oid, storeId, mid, false);
    expect(await service.canCreateProductInStore(mid, storeId)).toBe(false);
  });
});

// //Use Case 4.2
// //TODO: doesnt work
// describe("Add Constraint", () => {
//   beforeEach(async () => {
//     await resetDB();
//     service = new Service();
//   });
//   it("✅ Only with 3 bananas", async () => {
//     const email = faker.internet.email();
//     const password = faker.internet.password();
//     const id = await service.startSession();
//     await service.registerMember(id, email, password);
//     const uid = await service.loginMember(id, email, password);
//     const storeName = generateStoreName();
//     const storeId = await service.createStore(uid, storeName);
//     const ownermail = "owner@gmail.com";
//     const ownerpass = "owner123";
//     const oid2 = await service.startSession();
//     await service.registerMember(oid2, ownermail, ownerpass);
//     const oid = await service.loginMember(oid2, ownermail, ownerpass);
//     const pargs2 = generateProductArgs();
//     pargs2.name = "Banana";
//     pargs2.quantity = 5;
//     const bananaId = await service.createProduct(uid, storeId, pargs2);
//     pargs2.name = "tomato";
//     const tomatoId = await service.createProduct(uid, storeId, pargs2);
//     const cargs: ConditionArgs = {
//       conditionType: "Exactly",
//       type: "Literal",
//       searchFor: bananaId,
//       amount: 3,
//       subType: "Price",
//     };
//     await service.addConstraintToStore(uid, storeId, cargs);//TODO: seems like it doesnt add to the DB what is it looking for
//     await service.createProduct(uid, storeId, pargs2);
//     await service.addProductToCart(oid, bananaId, 2);//shouldnt allow this because of constraint to buy 3 bananas exactly
//     const card = faker.finance.creditCardNumber();
//     const cCard: PaymentDetails = {
//       number: card,
//       ccv: "144",
//       holder: "Buya",
//       id: "111111111",
//       month: "3",
//       year: "2025",
//     };
//     const d: DeliveryDetails = {
//       address: "dsadas",
//       city: "asdasd",
//       country: "sadasd",
//       name: "bsajsa",
//       zip: "2143145",
//     };
//     await expect(() => service.purchaseCart(oid, cCard, d)).rejects.toThrow(
//       TRPCError
//     );
//     await service.addProductToCart(oid, tomatoId, 2);
//     await expect(() => service.purchaseCart(oid, cCard, d)).rejects.toThrow(
//       TRPCError
//     );
//     await service.editProductQuantityInCart(oid, bananaId, 3);
//     await service.purchaseCart(oid, cCard, d);
//     expect(
//       !(await service.isProductQuantityInStock(uid, tomatoId, 3)) &&
//         (await service.isProductQuantityInStock(uid, tomatoId, 2)) &&
//         !(await service.isProductQuantityInStock(uid, bananaId, 3)) &&
//         (await service.isProductQuantityInStock(uid, bananaId, 2))
//     ).toBe(true);
//   });
// });

//adding owner tests(after requirements change to require approval of all owners)
describe("Add Owner require approval", () => {
  let email: string,
    password: string,
    gid: string,
    founderId: string,
    storeName: string,
    storeId: string,
    owner1mail: string,
    owner1pass: string,
    owner1Id: string,
    gid2: string,
    pargs: {
      name: string;
      quantity: number;
      price: number;
      category: string;
      description: string;
    };
  let customerId: string;
  beforeEach(async () => {
    await resetDB();
    service = new Service();
    email = faker.internet.email();
    password = faker.internet.password();
    gid = await service.startSession();
    await service.registerMember(gid, email, password);
    founderId = await service.loginMember(gid, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(founderId, storeName);
    owner1mail = "owner@gmail.com";
    owner1pass = "owner123";
    gid2 = await service.startSession();
    owner1Id = await service.registerMember(gid2, owner1mail, owner1pass);
    // await service.makeStoreOwner(founderId, storeId, owner1Id);
    customerId = await service.startSession();
    const customerEmail = faker.internet.email();
    const customerPassword = faker.internet.password();
    customerId = await service.registerMember(
      customerId,
      customerEmail,
      customerPassword
    );
    // pargs = generateProductArgs();
    // pargs.quantity = 7;
  });
  //founder adds owner, this needs to work as the founder is the only owner(so no need for approval)
  it("✅ founder adds owner", async () => {
    await service.makeStoreOwner(founderId, storeId, owner1Id);
    await expect(service.isStoreOwner(owner1Id, storeId)).resolves.toBe(true);
  });
  //founder adds owner1, owner1 adds customer as owner. Now customer isnt appointed till founder approves
  it("✅ founder adds owner1, owner1 adds customer. Now customer isnt appointed till founder approves", async () => {
    await service.makeStoreOwner(founderId, storeId, owner1Id);
    expect(await service.isStoreOwner(owner1Id, storeId)).toBe(true);
    const makeStoreOwnerRequestId = await service.makeStoreOwner(
      owner1Id,
      storeId,
      customerId
    );
    expect(await service.isStoreOwner(customerId, storeId)).toBe(false);
    await service.approveStoreOwner(makeStoreOwnerRequestId, founderId); //this currently doesnt work because makeStoreOwner doesnt return the request id as it should
    expect(await service.isStoreOwner(customerId, storeId)).toBe(true);
  });
  //founder adds owner1, owner1 adds customer as owner. Now customer isnt appointed till founder approves(should fail)
  it("❌ founder adds owner1, owner1 adds customer. Now customer isnt appointed till founder approves(should fail)", async () => {
    await service.makeStoreOwner(founderId, storeId, owner1Id);
    expect(await service.isStoreOwner(owner1Id, storeId)).toBe(true);
    const makeStoreOwnerRequestId = await service.makeStoreOwner(
      owner1Id,
      storeId,
      customerId
    );
    expect(await service.isStoreOwner(customerId, storeId)).toBe(false);
  });
  //a non owner tries to add owner to store
  it("❌ a non owner tries to add owner to store", async () => {
    await expect(() =>
      service.makeStoreOwner(customerId, storeId, owner1Id)
    ).rejects.toThrow(TRPCError);
  });
  //a non owner tries to approve owner to store(same one that is appointed and antoher unrelated one)
  it("❌ a non owner tries to approve owner to store", async () => {
    await service.makeStoreOwner(founderId, storeId, owner1Id);
    expect(await service.isStoreOwner(owner1Id, storeId)).toBe(true);
    const makeStoreOwnerRequestId = await service.makeStoreOwner(
      owner1Id,
      storeId,
      customerId
    );
    expect(await service.isStoreOwner(customerId, storeId)).toBe(false);
    await expect(() =>
      service.approveStoreOwner(makeStoreOwnerRequestId, customerId)
    ).rejects.toThrow(TRPCError);
    //create another user
    const customer2Email = faker.internet.email();
    const customer2Password = faker.internet.password();
    const customerId2 = await service.registerMember(
      customerId,
      customer2Email,
      customer2Password
    );
    await expect(() =>
      service.approveStoreOwner(makeStoreOwnerRequestId, customerId2)
    ).rejects.toThrow(TRPCError);
  });
});

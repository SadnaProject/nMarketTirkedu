import { faker } from "@faker-js/faker/locale/en";
import { type StoreProductArgs } from "server/domain/Stores/StoreProduct";
import {
  generateProductArgs,
  generateStoreName,
} from "server/data/Stores/helpers/_data";
import { Service } from "server/service/Service";
import { describe, expect, it, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

let service: Service;
beforeEach(() => {
  service = new Service();
});
//Use Case 2.1
describe("Get information about stores and products", () => {
  it("✅ Get information about stores and products", async () => {
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
    const pid = await service.createProduct(oid, storeId, pargs);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    const products = await service.getStoreProducts(uid, storeId);
    const cond =
      products[0]?.id === pid &&
      (await service.getStoreFounder(storeId)) === uid;
    expect(cond).toBe(true);
  });
  it("❎ Information of non existing store", async () => {
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
    const pid = await service.createProduct(oid, storeId, pargs);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    expect(() => service.getStoreFounder("ashaleee")).toThrow(TRPCError);
  });
});
//Use Case 2.2
describe("Search Products", () => {
  let pargs1: StoreProductArgs,
    pargs2: StoreProductArgs,
    pargs3: StoreProductArgs,
    umid: string;
  let storeId: string;
  beforeEach(async () => {
    pargs1 = generateProductArgs();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = await service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    storeId = await service.createStore(uid, storeName);
    const ownermail = "owner@gmail.com";
    const ownerpass = "owner123";
    const oid2 = await service.startSession();
    await service.registerMember(oid2, ownermail, ownerpass);
    const oid = await service.loginMember(oid2, ownermail, ownerpass);
    await service.makeStoreOwner(uid, storeId, oid);
    const pid1 = await service.createProduct(oid, storeId, pargs1);
    pargs2 = generateProductArgs();
    pargs2.quantity = 6;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    pargs3 = generateProductArgs();
    pargs3.quantity = 7;
    const pid3 = await service.createProduct(oid, storeId, pargs3);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    umid = await service.loginMember(mid, memail, mpassword);
    const products = [
      {
        ...pargs1,
        id: pid1,
      },
      {
        ...pargs2,
        id: pid2,
      },
      {
        ...pargs3,
        id: pid3,
      },
    ];
  });
  it("✅should return all products", async () => {
    const res = await service.searchProducts(umid, {});
    expect(res.length).toEqual(3);
  });
  it("✅should return some products because of name filter", async () => {
    const res = await service.searchProducts(umid, {
      name: pargs1.name.toUpperCase().split(" ")[0],
    });
    expect(res.length > 0).toBe(true);
  });

  it("✅should return some products because of keywords", async () => {
    const res = await service.searchProducts(umid, {
      keywords: [pargs1.description.toUpperCase().split(" ")[1] ?? ""],
    });
    expect(res.length > 0).toBe(true);
  });

  it("✅shouldn't return products because of made up name", async () => {
    const res = await service.searchProducts(umid, {
      name: "made up name that doesn't exist",
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of made up category", async () => {
    const res = await service.searchProducts(umid, {
      category: "made up category that doesn't exist",
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of made up keywords", async () => {
    const res = await service.searchProducts(umid, {
      keywords: ["made up keyword that doesn't exist"],
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of high min price", async () => {
    const res = await service.searchProducts(umid, {
      minPrice: Infinity,
    });
    expect(res).toEqual([]);
  });

  it("✅shouldn't return products because of low max price", async () => {
    const res = await service.searchProducts(umid, {
      maxPrice: 0,
    });
    expect(res).toEqual([]);
  });
});
//Use Case 2.3
describe("Keep an Item in the cart", () => {
  it("✅ Add item to cart and keep it after disconnecting", async () => {
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
    const cart = await service.getCart(umid);
    expect(
      cart.storeIdToBasket.get(storeId)?.products.at(0)?.storeProductId === pid
    ).toBe(true);
    const mid2 = await service.logoutMember(umid);
    const umid2 = await service.loginMember(mid2, memail, mpassword);
    const cart2 = await service.getCart(umid2);
    expect(
      cart2.storeIdToBasket.get(storeId)?.products.at(0)?.storeProductId === pid
    ).toBe(true);
  });
});
//Use Case 2.4
describe("Edit cart contents", () => {
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
    pid: string,
    pargs: {
      name: string;
      quantity: number;
      price: number;
      category: string;
      description: string;
    },
    memail: string,
    mpassword: string,
    mid: string,
    umid: string;
  beforeEach(async () => {
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
    pargs.quantity = 7;
    pid = await service.createProduct(oid, storeId, pargs);
    memail = "member@gmail.com";
    mpassword = faker.internet.password();
    mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    umid = await service.loginMember(mid, memail, mpassword);
  });
  it("✅ Add item to cart", async () => {
    const pargs2 = generateProductArgs();
    pargs2.quantity = 5;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    await service.addProductToCart(umid, pid, 1);
    const cart = await service.getCart(umid);
    await service.addProductToCart(umid, pid2, 3);
    const cart2 = await service.getCart(umid);
    expect(
      cart2.storeIdToBasket.get(storeId)?.products[0]?.storeProductId === pid &&
        cart2.storeIdToBasket.get(storeId)?.products[1]?.storeProductId ==
          pid2 &&
        cart2.storeIdToBasket.get(storeId)?.products.length === 2 &&
        cart.storeIdToBasket.get(storeId)?.products.length === 1 &&
        cart.storeIdToBasket.get(storeId)?.products[0]?.storeProductId === pid
    ).toBe(true);
  });
  it("✅ Edit quantity", async () => {
    await service.addProductToCart(umid, pid, 7);
    const q1 = (await service.getCart(umid)).storeIdToBasket.get(storeId)
      ?.products[0]?.quantity;
    await service.editProductQuantityInCart(umid, pid, 4);
    const q2 = (await service.getCart(umid)).storeIdToBasket.get(storeId)
      ?.products[0]?.quantity;
    expect(q1 === 7 && q2 === 4).toBe(true);
  });
  it("✅ Remove existing item", async () => {
    await service.addProductToCart(umid, pid, 7);
    const q1 = (await service.getCart(umid)).storeIdToBasket.get(storeId)
      ?.products[0]?.quantity;
    await service.removeProductFromCart(umid, pid);
    expect(
      (await service.getCart(umid)).storeIdToBasket.get(storeId)?.products
        .length === 0
    ).toBe(true);
  });
  it("❎ Remove non-existing item", () => {
    expect(() => service.removeProductFromCart(umid, pid)).toThrow(TRPCError);
  });
});
//Use Case 2.5
describe("Purchase Cart", () => {
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
    pargs.quantity = 7;
  });
  it("✅ Simple Purchase", async () => {
    const pid = await service.createProduct(oid, storeId, pargs);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 5;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    await service.addProductToCart(umid, pid, 1);
    await service.addProductToCart(umid, pid2, 3);
    const card = faker.finance.creditCardNumber();
    const cCard = { number: card };
    await service.purchaseCart(umid, cCard);
    const cart = (await service.getCart(umid)).storeIdToBasket;
    const b = await service.isProductQuantityInStock(umid, pid, 7);
    expect(
      !(await service.isProductQuantityInStock(umid, pid, 7)) &&
        (await service.isProductQuantityInStock(umid, pid, 6)) &&
        !(await service.isProductQuantityInStock(umid, pid2, 3)) &&
        (await service.isProductQuantityInStock(umid, pid2, 2))
    ).toBe(true);
  });
  it("❎ Purchase cart with out of stock product", async () => {
    const pid = await service.createProduct(oid, storeId, pargs);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 1;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    await service.addProductToCart(umid, pid, 4);
    expect(() => service.addProductToCart(umid, pid2, 3)).toThrow(TRPCError);
    const card = faker.finance.creditCardNumber();
    const cCard = { number: card };
    await service.decreaseProductQuantity(pid, 4);
    expect(() => service.purchaseCart(umid, cCard)).toThrow(TRPCError);
  });
  it("❎ Purchasing items that were on stock when added to cart but another user bought them", async () => {
    const pid = await service.createProduct(oid, storeId, pargs);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 5;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    await service.addProductToCart(umid, pid, 1);
    await service.addProductToCart(umid, pid2, 3);
    const card = faker.finance.creditCardNumber();
    const card2 = faker.finance.creditCardNumber();
    const mid2 = await service.startSession();
    await service.addProductToCart(mid2, pid, 7);
    await service.addProductToCart(mid2, pid2, 5);
    const cCard = { number: card };
    const cCard2 = { number: card2 };
    await service.purchaseCart(umid, cCard);
    expect(() => service.purchaseCart(mid2, cCard2)).toThrow(TRPCError);
  });
  it("❎ Empty Cart Purchase", async () => {
    const pid = await service.createProduct(oid, storeId, pargs);
    const pargs2 = generateProductArgs();
    pargs2.quantity = 5;
    const pid2 = await service.createProduct(oid, storeId, pargs2);
    const memail = "member@gmail.com";
    const mpassword = faker.internet.password();
    const mid = await service.startSession();
    await service.registerMember(mid, memail, mpassword);
    const umid = await service.loginMember(mid, memail, mpassword);
    const card = faker.finance.creditCardNumber();
    const cCard = { number: card };
    expect(() => service.purchaseCart(umid, cCard)).toThrow(TRPCError);
    expect(() => service.removeProductFromCart(umid, pid)).toThrow(TRPCError);
  });
});

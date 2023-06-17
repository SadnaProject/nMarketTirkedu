import { faker } from "@faker-js/faker/locale/en";
import { type StoreProductArgs } from "server/domain/Stores/StoreProduct";

import { Service } from "server/service/Service";
import { describe, expect, it, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { getDB, resetDB } from "server/helpers/_Transactional";
import { type BidArgs } from "server/domain/Users/Bid";
import { type ConditionArgs } from "server/domain/Stores/Conditions/CompositeLogicalCondition/Condition";
import {
  createCompositeConditionArgs,
  createCompositeDiscountArgs,
  createLiteralConditionArgs,
  createPromise,
  createSimpleDiscountArgs,
  createStore,
  createStoreWithProduct,
  createTimeConditionArgs,
  generateProductArgs,
  generateStoreName,
} from "../../server/data/Stores/helpers/_data";
import { init } from "ramda";
let service: Service;
beforeEach(async () => {
  await resetDB();
  service = new Service();
});

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
    await expect(() => service.getStoreFounder("ashaleee")).rejects.toThrow(
      "Store not found"
    );
  });
});
// Use Case 2.2
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

//THE TESTS ABOVE PASS
// Use Case 2.4
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
  it("❎ Remove non-existing item", async () => {
    await expect(() =>
      service.removeProductFromCart(umid, pid)
    ).rejects.toThrow("Product not found");
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
    await expect(() => service.addProductToCart(umid, pid2, 3)).rejects.toThrow(
      "store doesn't have such amount of product"
    );
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
    await service.decreaseProductQuantity(pid, 4);
    await expect(() => service.purchaseCart(umid, cCard, d)).rejects.toThrow(
      "Product quantity is not available"
    );
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
    await expect(() => service.purchaseCart(mid2, cCard, d)).rejects.toThrow(
      TRPCError
    );
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
    await expect(() => service.purchaseCart(umid, cCard, d)).rejects.toThrow(
      "Cart is empty, please add products to cart before purchasing"
    );
    // expect(() => service.removeProductFromCart(umid, pid)).toThrow(TRPCError);
  });
});

// ALL PASS FROM HERE
// bid user story
// When calculating the price of a product, the system uses the function getProductPrice(userID, productID) which returns the price of the product for the given user.
// There for, it is enough to test the function getProductPrice(userID, productID) to test the bid user story, and there is no need to calculate the price of the cart.
// just in case
// Use Case 2.5 - Bid
describe("Bid User Story", () => {
  let email: string,
    password: string,
    gid: string,
    founderId: string,
    storeName: string,
    storeId: string,
    ownermail: string,
    ownerpass: string,
    ownerId: string,
    gid2: string,
    pargs: {
      name: string;
      quantity: number;
      price: number;
      category: string;
      description: string;
    };
  let customerId: string;
  let productInitialPrice: number;
  let productId: string;
  let bidArgs: BidArgs;
  beforeEach(async () => {
    await resetDB();
    email = faker.internet.email();
    password = faker.internet.password();
    gid = await service.startSession();
    await service.registerMember(gid, email, password);
    founderId = await service.loginMember(gid, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(founderId, storeName);
    ownermail = "owner@gmail.com";
    ownerpass = "owner123";
    gid2 = await service.startSession();
    ownerId = await service.registerMember(gid2, ownermail, ownerpass);
    await service.makeStoreOwner(founderId, storeId, ownerId);
    customerId = await service.startSession();
    const customerEmail = faker.internet.email();
    const customerPassword = faker.internet.password();
    customerId = await service.registerMember(
      customerId,
      customerEmail,
      customerPassword
    );
    pargs = generateProductArgs();
    pargs.quantity = 7;
    productInitialPrice = pargs.price;
    productId = await service.createProduct(ownerId, storeId, pargs);
    bidArgs = {
      userId: customerId,
      price: 5,
      productId: productId,
      type: "Store",
    };
  });
  it("Bid on product and then all owners approved it", async () => {
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    //cart price is the same as product price
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //owners and founder accept bids
    await service.approveBid(ownerId, bid);
    //if not all owners approved bid, product price doesnt change
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    await service.approveBid(founderId, bid);
    const price = await service.getProductPrice(customerId, productId);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      bidArgs.price
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(bidArgs.price);
  });
  it("❌ Bid on product and then only one owner approved it, price shouldnt change", async () => {
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //owner accepts bid
    await service.approveBid(ownerId, bid);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
  });
  it("❌ Bid on product not approved", async () => {
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //founder accepts bid but owner rejects it
    await service.approveBid(founderId, bid);
    await service.rejectBid(ownerId, bid);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
  });
  it("❌ Bid on product not approved by owner that tries to approve it after his rejection", async () => {
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //founder accepts bid but owner rejects it and then tries to approve it
    await service.approveBid(founderId, bid);
    await service.rejectBid(ownerId, bid);

    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.approveBid(ownerId, bid)).rejects.toThrow(
      "Bid is not waiting for approval"
    );
  });
  //customer bids on product, owner counter offers, customer accepts counter offer
  it("✅ Bid on product, owner counter offers, customer accepts counter offer", async () => {
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //owner counter offers
    const counterBidArgs: BidArgs = {
      userId: ownerId,
      price: 10,
      productId: productId,
      type: "Counter",
      previousBidId: bid,
    };
    const counterBid = await service.addBid(counterBidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //customer accepts counter offer
    const newID = await service.approveBid(customerId, counterBid);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    await service.approveBid(ownerId, newID);
    await service.approveBid(founderId, newID);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      counterBidArgs.price
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      counterBidArgs.price
    );
  });
  //customer bids on product, owner counter offers, customer rejects counter offer and bids again. owner accepts second bid
  it("✅ Bid on product, owner counter offers, customer rejects counter offer and bids again. owner accepts second bid", async () => {
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //owner counter offers
    const counterBidArgs: BidArgs = {
      userId: ownerId,
      price: 10,
      productId: productId,
      type: "Counter",
      previousBidId: bid,
    };
    const counterBid = await service.addBid(counterBidArgs);
    console.log("counterBid", counterBid);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //customer rejects counter offer
    await service.rejectBid(customerId, counterBid);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //customer bids again
    const bid2 = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //owners accepts second bid
    await service.approveBid(ownerId, bid2);
    await service.approveBid(founderId, bid2);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      bidArgs.price
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(bidArgs.price);
  });
  //not owner of store tries to approve bid on product
  it("❌ Not owner of store tries to approve bid on product", async () => {
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );

    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //not owner of store tries to approve bid
    await expect(service.approveBid(customerId, bid)).rejects.toThrow(
      "User doesn't have permission to approve bid"
    );
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
  });
  //if an owner of a store is removed, he can't approve bids and we dont need him to approve bids
  it("✅ If an owner of a store is removed, he can't approve bids and we dont need him to approve bids", async () => {
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(
      productInitialPrice
    );
    //owner removes himself from store
    await service.removeStoreOwner(founderId, storeId, ownerId);
    //owner tries to approve bid
    await expect(service.approveBid(ownerId, bid)).rejects.toThrow(
      "User doesn't have permission to approve bid"
    );
    //founder approves bid
    await service.approveBid(founderId, bid);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      bidArgs.price
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(bidArgs.price);
  });
  //when a bid of a customer changes, the price of the product changes for all future purchases
  it("✅ When a bid of a customer changes, the price of the product changes for all future purchases", async () => {
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await service.approveBid(ownerId, bid);
    await service.approveBid(founderId, bid);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      bidArgs.price
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(bidArgs.price);
    const cCard: PaymentDetails = {
      number: faker.finance.creditCardNumber(),
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
    await service.purchaseCart(customerId, cCard, d);
    //check that the cart is empty
    await expect(service.getCartPrice(customerId)).resolves.toBe(0);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      bidArgs.price
    );
    //once again add product to cart
    await service.addProductToCart(customerId, productId, 1);
    await expect(service.getCartPrice(customerId)).resolves.toBe(bidArgs.price);
  });
  //After a bid is approved, the product price is updated only for the customer that made the bid
  it("✅ After a bid is approved, the product price is updated only for the customer that made the bid", async () => {
    const customerId2 = await service.startSession();
    //customer adds product to cart
    await service.addProductToCart(customerId, productId, 1);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    //customer bids on product
    const bid = await service.addBid(bidArgs);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      productInitialPrice
    );
    await service.approveBid(ownerId, bid);
    await service.approveBid(founderId, bid);
    await expect(service.getProductPrice(customerId, productId)).resolves.toBe(
      bidArgs.price
    );
    await expect(service.getCartPrice(customerId)).resolves.toBe(bidArgs.price);
    //another customer adds product to cart
    await service.addProductToCart(customerId2, productId, 1);
    await expect(service.getProductPrice(customerId2, productId)).resolves.toBe(
      productInitialPrice
    );
    await expect(service.getCartPrice(customerId2)).resolves.toBe(
      productInitialPrice
    );
  });
});

describe("Constraint Tests", () => {
  beforeEach(async () => {
    await resetDB();
    service = new Service();
  });
  it("Only with 3 bananas", async () => {
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
    const pargs2 = generateProductArgs();
    pargs2.name = "Banana";
    pargs2.quantity = 5;
    const bananaId = await service.createProduct(uid, storeId, pargs2);
    pargs2.name = "tomato";
    const tomatoId = await service.createProduct(uid, storeId, pargs2);
    const cargs: ConditionArgs = {
      conditionType: "Exactly",
      type: "Literal",
      searchFor: "Banana",
      amount: 3,
      subType: "Product",
    };
    await service.addConstraintToStore(uid, storeId, cargs); //TODO: seems like it doesnt add to the DB what is it looking for
    await service.createProduct(uid, storeId, pargs2);
    await service.addProductToCart(oid, bananaId, 2); //shouldn't allow this because of constraint to buy 3 bananas exactly
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
    await expect(() => service.purchaseCart(oid, cCard, d)).rejects.toThrow(
      "Basket does not satisfy store constraints"
    );
    await service.addProductToCart(oid, tomatoId, 3);
    await expect(() => service.purchaseCart(oid, cCard, d)).rejects.toThrow(
      "Basket does not satisfy store constraints"
    );
    await service.editProductQuantityInCart(oid, bananaId, 3);
    await service.purchaseCart(oid, cCard, d);
    const supposeToBeFalse = await service.isProductQuantityInStock(
      uid,
      tomatoId,
      3
    );
    const supposeToBeFalse1 = await service.isProductQuantityInStock(
      uid,
      bananaId,
      3
    );
    const supposeToBeTrue = await service.isProductQuantityInStock(
      uid,
      tomatoId,
      2
    );
    const supposeToBeTrue1 = await service.isProductQuantityInStock(
      uid,
      bananaId,
      2
    );
    expect(supposeToBeFalse).toBe(false);
    expect(supposeToBeFalse1).toBe(false);
    expect(supposeToBeTrue).toBe(true);
    expect(supposeToBeTrue1).toBe(true);
  });
});
async function getProductQuantity(
  userId: string,
  storeId: string,
  productId: string
): Promise<number> {
  const storeProducts = await service.getStoreProducts(userId, storeId);
  const product = storeProducts.find((p) => p.id === productId);
  if (!product) throw new Error("product not found");
  return product.quantity;
}

describe("Constraint tests", () => {
  let email;
  let milkData: StoreProductArgs;
  let meatData: StoreProductArgs;
  let password: string;
  let id: string;
  let founderId: string;
  let storeId: string;
  let storeName: string;
  let milkId: string;
  let meatId: string;
  let customerId: string;
  let cCard: PaymentDetails;
  let d: DeliveryDetails;
  beforeEach(async () => {
    await resetDB();
    service = new Service();
    milkData = generateProductArgs();
    milkData.quantity = 5;
    milkData.name = "Milk";
    milkData.category = "Food";
    email = faker.internet.email();
    password = faker.internet.password();
    id = await service.startSession();
    await service.registerMember(id, email, password);
    founderId = await service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(founderId, storeName);
    milkId = await service.createProduct(founderId, storeId, milkData);

    milkData.quantity = 5;
    meatData = generateProductArgs();
    meatData.name = "Meat";
    meatData.category = "Meat";
    meatData.quantity = 5;
    const product1BasketQuantity = 55;
    const product2BasketQuantity = 23;
    meatId = await service.createProduct(founderId, storeId, meatData);

    customerId = await service.startSession();
    const card = faker.finance.creditCardNumber();
    cCard = {
      number: card,
      ccv: "144",
      holder: "Buya",
      id: "111111111",
      month: "3",
      year: "2025",
    };
    d = {
      address: "dsadas",
      city: "asdasd",
      country: "sadasd",
      name: "bsajsa",
      zip: "2143145",
    };
  });
  it("add simple constraint to product and check if it works", async () => {
    const cargs: ConditionArgs = {
      conditionType: "Exactly",
      type: "Literal",
      searchFor: "Milk",
      amount: 3,
      subType: "Product",
    };
    await service.addConstraintToStore(founderId, storeId, cargs);
    await service.addProductToCart(customerId, milkId, 2);
    // let storeProducts = await service.getStoreProducts(founderId, storeId);
    // let product = storeProducts.find((p) => p.id === milkId);
    // if (!product) throw new Error("product not found");

    // expect(product.quantity).toBe(3);
    const initialQuantity = await getProductQuantity(
      founderId,
      storeId,
      milkId
    );
    await expect(() =>
      service.purchaseCart(customerId, cCard, d)
    ).rejects.toThrow("Basket does not satisfy store constraints");
    const productQuantity = await getProductQuantity(
      founderId,
      storeId,
      milkId
    );
    expect(productQuantity).toBe(initialQuantity);
    await service.addProductToCart(customerId, milkId, 3);
    await service.purchaseCart(customerId, cCard, d);
    // storeProducts = await service.getStoreProducts(founderId, storeId);
    // product = storeProducts.find((p) => p.id === milkId);
    // if (!product) throw new Error("product not found");
    await expect(getProductQuantity(founderId, storeId, milkId)).resolves.toBe(
      initialQuantity - 3
    );
  });

  it("add composite AND constraint to store and check if it works", async () => {
    const condition = createCompositeConditionArgs(
      "And",
      createLiteralConditionArgs("", 2, "Store", "AtLeast"),
      createLiteralConditionArgs("", 2, "Store", "AtMost")
    );
    const initialQuantity = await getProductQuantity(
      founderId,
      storeId,
      milkId
    );
    await service.addConstraintToStore(founderId, storeId, condition);
    await service.addProductToCart(customerId, milkId, 1);

    // await service.addProductToCart(customerId, meatId, 1);
    await expect(() =>
      service.purchaseCart(customerId, cCard, d)
    ).rejects.toThrow("Basket does not satisfy store constraints");
    await expect(getProductQuantity(founderId, storeId, milkId)).resolves.toBe(
      initialQuantity
    );
    await service.addProductToCart(customerId, milkId, 3);
    await expect(() =>
      service.purchaseCart(customerId, cCard, d)
    ).rejects.toThrow("Basket does not satisfy store constraints");
    await expect(getProductQuantity(founderId, storeId, milkId)).resolves.toBe(
      initialQuantity
    );
    await service.addProductToCart(customerId, milkId, 1);
    await service.addProductToCart(customerId, meatId, 1);
    await service.purchaseCart(customerId, cCard, d);
    await expect(getProductQuantity(founderId, storeId, milkId)).resolves.toBe(
      initialQuantity - 1
    );
    await expect(getProductQuantity(founderId, storeId, meatId)).resolves.toBe(
      initialQuantity - 1
    );
  });

  it("add composite xor constraint to store and check if it works", async () => {
    const condition = createCompositeConditionArgs(
      "Xor",
      createLiteralConditionArgs("", 3, "Store", "AtMost"),
      createLiteralConditionArgs("", 1, "Store", "AtLeast")
    );
    const initialQuantity = await getProductQuantity(
      founderId,
      storeId,
      milkId
    );
    const constraintId = await service.addConstraintToStore(
      founderId,
      storeId,
      condition
    );
    await service.addProductToCart(customerId, milkId, 1);
    await service.addProductToCart(customerId, meatId, 1);
    await expect(() =>
      service.purchaseCart(customerId, cCard, d)
    ).rejects.toThrow("Basket does not satisfy store constraints");
    await expect(getProductQuantity(founderId, storeId, milkId)).resolves.toBe(
      initialQuantity
    );
    await expect(getProductQuantity(founderId, storeId, meatId)).resolves.toBe(
      initialQuantity
    );
    await service.removeConstraintFromStore(founderId, storeId, constraintId);
    const condition2 = createCompositeConditionArgs(
      "Xor",
      createLiteralConditionArgs("", 5, "Store", "AtLeast"),
      createLiteralConditionArgs("", 2, "Store", "AtLeast")
    );
    const constraintId2 = await service.addConstraintToStore(
      founderId,
      storeId,
      condition2
    );
    await service.addProductToCart(customerId, milkId, 1);
    await service.addProductToCart(customerId, meatId, 1);
    await service.purchaseCart(customerId, cCard, d);
    await expect(getProductQuantity(founderId, storeId, milkId)).resolves.toBe(
      initialQuantity - 1
    );
    await expect(getProductQuantity(founderId, storeId, meatId)).resolves.toBe(
      initialQuantity - 1
    );
  });

  it("add time constraint to store and check if it works", async () => {
    const date = new Date();
    const constraintId = await service.addConstraintToStore(
      founderId,
      storeId,
      createTimeConditionArgs(
        "After",
        date.getFullYear() + 1,
        undefined,
        undefined,
        undefined
      )
    );
    await service.addProductToCart(customerId, milkId, 1);
    const initialQuantity = await getProductQuantity(
      founderId,
      storeId,
      milkId
    );
    await expect(() =>
      service.purchaseCart(customerId, cCard, d)
    ).rejects.toThrow("Basket does not satisfy store constraints");
    await expect(getProductQuantity(founderId, storeId, milkId)).resolves.toBe(
      initialQuantity
    );
    await service.removeConstraintFromStore(founderId, storeId, constraintId);
    const constraintId2 = await service.addConstraintToStore(
      founderId,
      storeId,
      createTimeConditionArgs(
        "After",
        date.getFullYear() - 1,
        undefined,
        undefined,
        undefined
      )
    );
    await service.purchaseCart(customerId, cCard, d);
    await expect(getProductQuantity(founderId, storeId, milkId)).resolves.toBe(
      initialQuantity - 1
    );
  });
});

describe("Discounts", () => {
  let email;
  let milkData: StoreProductArgs;
  let meatData: StoreProductArgs;
  let password: string;
  let id: string;
  let founderId: string;
  let storeId: string;
  let storeName: string;
  let milkId: string;
  let meatId: string;
  let customerId: string;
  beforeEach(async () => {
    await resetDB();
    service = new Service();
    milkData = generateProductArgs();
    milkData.quantity = 5;
    milkData.name = "Milk";
    milkData.category = "Food";
    email = faker.internet.email();
    password = faker.internet.password();
    id = await service.startSession();
    await service.registerMember(id, email, password);
    founderId = await service.loginMember(id, email, password);
    storeName = generateStoreName();
    storeId = await service.createStore(founderId, storeName);
    milkId = await service.createProduct(founderId, storeId, milkData);

    milkData.quantity = 5;
    meatData = generateProductArgs();
    meatData.name = "Meat";
    meatData.category = "Meat";
    meatData.quantity = 5;
    const product1BasketQuantity = 55;
    const product2BasketQuantity = 23;
    meatId = await service.createProduct(founderId, storeId, meatData);

    customerId = await service.startSession();
  });
  it("add simple product discount", async () => {
    //add product to basket
    await service.addProductToCart(customerId, milkId, 1);
    const initialPrice = await service.getCartPrice(customerId);
    let suppose = milkData.price;
    expect(initialPrice).toBe(suppose);
    const DiscountArgs = createSimpleDiscountArgs(
      milkData.name,
      15,
      "product",
      createLiteralConditionArgs(milkData.name, 1, "Product", "AtLeast")
    );
    const discountId = await service.addDiscountToStore(
      founderId,
      storeId,
      DiscountArgs
    );

    const priceWithDiscount = await service.getCartPrice(customerId);
    suppose = milkData.price * (85 / 100);
    expect(priceWithDiscount).toBe(suppose);
    await service.removeDiscountFromStore(founderId, storeId, discountId);
    expect(await service.getCartPrice(customerId)).toBe(initialPrice);
  });
  it("add simple category discount", async () => {
    //add product to basket
    await service.addProductToCart(customerId, milkId, 1);
    const initialPrice = await service.getCartPrice(customerId);
    let suppose = milkData.price;
    expect(initialPrice).toBe(suppose);
    const DiscountArgs = createSimpleDiscountArgs(
      milkData.category,
      15,
      "category",
      createLiteralConditionArgs(milkData.category, 1, "Category", "AtLeast")
    );
    const discountId = await service.addDiscountToStore(
      founderId,
      storeId,
      DiscountArgs
    );
    const priceWithDiscount = await service.getCartPrice(customerId);
    suppose = milkData.price * (85 / 100);
    expect(priceWithDiscount).toBe(suppose);
    await service.removeDiscountFromStore(founderId, storeId, discountId);
    expect(await service.getCartPrice(customerId)).toBe(initialPrice);
  });

  it("add simple price discount", async () => {
    //add product to basket
    await service.addProductToCart(customerId, milkId, 1);
    await service.addProductToCart(customerId, meatId, 1);
    const initialPrice = await service.getCartPrice(customerId);
    let suppose = milkData.price + meatData.price;
    expect(initialPrice).toBe(suppose);
    const DiscountArgs = createSimpleDiscountArgs(
      milkData.category,
      15,
      "category",
      createLiteralConditionArgs(
        milkData.category,
        milkData.price - 5,
        "Price",
        "AtLeast"
      )
    );
    const discountId = await service.addDiscountToStore(
      founderId,
      storeId,
      DiscountArgs
    );
    const priceWithDiscount = await service.getCartPrice(customerId);
    suppose = milkData.price * (85 / 100) + meatData.price;
    expect(priceWithDiscount).toBe(suppose);
    await service.removeDiscountFromStore(founderId, storeId, discountId);
    await expect(service.getCartPrice(customerId)).resolves.toBe(initialPrice);
    const DiscountArgs2 = createSimpleDiscountArgs(
      milkData.category,
      15,
      "category",
      createLiteralConditionArgs(
        milkData.category,
        milkData.price - 5,
        "Price",
        "AtMost"
      )
    );
    const discountId2 = await service.addDiscountToStore(
      founderId,
      storeId,
      DiscountArgs2
    );
    const priceWithDiscount2 = await service.getCartPrice(customerId);
    suppose = milkData.price + meatData.price;
    expect(priceWithDiscount2).toBe(initialPrice);
  });

  it("add simple basket discount", async () => {
    await service.addProductToCart(customerId, milkId, 1);
    await service.addProductToCart(customerId, meatId, 1);
    const initialPrice = await service.getCartPrice(customerId);
    const DiscountArgs = createSimpleDiscountArgs(
      milkData.category,
      15,
      "store",
      createLiteralConditionArgs(milkData.category, 1, "Store", "AtLeast")
    );
    const discountId = await service.addDiscountToStore(
      founderId,
      storeId,
      DiscountArgs
    );
    const priceWithDiscount = await service.getCartPrice(customerId);
    const suppose = milkData.price * (85 / 100) + meatData.price * (85 / 100);
    expect(priceWithDiscount).toBe(suppose);
    await service.removeDiscountFromStore(founderId, storeId, discountId);
    await expect(service.getCartPrice(customerId)).resolves.toBe(initialPrice);
  });

  it("add max discount with simple condition", async () => {
    //add product to basket
    await service.addProductToCart(customerId, milkId, 1);
    await service.addProductToCart(customerId, meatId, 1);
    const initialPrice = await service.getCartPrice(customerId);
    let suppose = milkData.price + meatData.price;
    expect(initialPrice).toBe(suppose);
    const DiscountArgs = createCompositeDiscountArgs(
      createSimpleDiscountArgs(
        milkData.category,
        15,
        "category",
        createLiteralConditionArgs(milkData.category, 1, "Store", "AtLeast")
      ),
      createSimpleDiscountArgs(
        milkData.category,
        15,
        "store",
        createLiteralConditionArgs(milkData.category, 1, "Store", "AtLeast")
      ),
      "Max"
    );
    const discountId = await service.addDiscountToStore(
      founderId,
      storeId,
      DiscountArgs
    );
    const priceWithDiscount = await service.getCartPrice(customerId);
    suppose = milkData.price * (85 / 100) + meatData.price * (85 / 100);
    expect(priceWithDiscount).toBe(suppose);
    await service.removeDiscountFromStore(founderId, storeId, discountId);
    await expect(service.getCartPrice(customerId)).resolves.toBe(initialPrice);
  });

  it("add compose ADD discount with simple condition", async () => {
    //add product to basket
    await service.addProductToCart(customerId, milkId, 1);
    await service.addProductToCart(customerId, meatId, 1);
    const initialPrice = await service.getCartPrice(customerId);
    let suppose = milkData.price + meatData.price;
    const DiscountArgs = createCompositeDiscountArgs(
      createSimpleDiscountArgs(
        milkData.category,
        15,
        "category",
        createLiteralConditionArgs(milkData.category, 1, "Store", "AtLeast")
      ),
      createSimpleDiscountArgs(
        milkData.category,
        15,
        "store",
        createLiteralConditionArgs(milkData.category, 1, "Store", "AtLeast")
      ),
      "Add"
    );
    const discountId = await service.addDiscountToStore(
      founderId,
      storeId,
      DiscountArgs
    );
    const priceWithDiscount = await service.getCartPrice(customerId);
    suppose = milkData.price * (70 / 100) + meatData.price * (85 / 100);
    expect(priceWithDiscount).toBe(suppose);
    await service.removeDiscountFromStore(founderId, storeId, discountId);
    await expect(service.getCartPrice(customerId)).resolves.toBe(initialPrice);
  });
});

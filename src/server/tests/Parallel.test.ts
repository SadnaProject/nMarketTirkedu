import { describe, expect, it, beforeEach } from "vitest";
import { benchmark } from "./_benchmark";
import { faker } from "@faker-js/faker/locale/en";
import {
  generateProductArgs,
  generateStoreName,
} from "server/domain/Stores/_data";
import { Service } from "server/service/Service";
import { TRPCError } from "@trpc/server";

let service: Service;
beforeEach(() => {
  service = new Service();
});

// since action takes time, it returns a promise
async function action(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds
  return Math.floor(Math.random() * 10); // random number between 0 and 9
}

describe("parallel actions", () => {
  it("✅runs 100 parallel actions", async () => {
    const promises: Promise<number>[] = [];
    for (let i = 0; i < 100; i++) {
      promises.push(action());
    }
    const results = await Promise.all(promises); // wait for all promises to succeed
    // expect all results to be between 0 and 9
    expect(results.every((result) => result >= 0 && result <= 9)).toBe(true);
  });

  // Promise functions:
  // - Promise.all - waits for all promises to succeed. Throws if some of them fail.
  // - Promise.allSettled - waits for all promises to end. Doesn't throw.
  // - Promise.any - waits until a promise succeeds. Throws if all of them fail.
  // - Promise.race - waits until a promise ends. Throws if it fails.

  it(
    "✅benchmark action",
    async () => {
      // start measuring after 4 seconds, stop after 5 seconds
      await benchmark(() => action(), 4000, 5000);
    },
    { timeout: 6000 } // stop test anyway after 6 seconds
  );
});
//Use Case 2.5
describe("Concurrent Purchase", () => {
  it("❎ Two users attempt to purchase the last product in stock, one of them must fail", async () => {
    for (let i = 0; i < 100; i++) {
      service = new Service();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const id = service.startSession();
      await service.registerMember(id, email, password);
      const uid = await service.loginMember(id, email, password);
      const storeName = generateStoreName();
      const storeId = await service.createStore(uid, storeName);
      const ownermail = "owner@gmail.com";
      const ownerpass = "owner123";
      const oid2 = service.startSession();
      await service.registerMember(oid2, ownermail, ownerpass);
      const oid = await service.loginMember(oid2, ownermail, ownerpass);
      await service.makeStoreOwner(uid, storeId, oid);
      const pargs = generateProductArgs();
      pargs.quantity = 1;
      const pid = await service.createProduct(oid, storeId, pargs);
      const memail = "member@gmail.com";
      const mpassword = faker.internet.password();
      const mid = service.startSession();
      await service.registerMember(mid, memail, mpassword);
      const umid = await service.loginMember(mid, memail, mpassword);
      service.addProductToCart(umid, pid, 1);
      const card = faker.finance.creditCardNumber();
      const card2 = faker.finance.creditCardNumber();
      const mid2 = service.startSession();
      service.addProductToCart(mid2, pid, 1);
      const cCard = { number: card };
      const cCard2 = { number: card2 };
      async function purchase() {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return service.purchaseCart(mid2, cCard2);
      }
      async function purchase2() {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return service.purchaseCart(umid, cCard);
      }
      const promises: Promise<string>[] = [];
      promises.push(purchase());
      promises.push(purchase2());
      const res = await Promise.allSettled(promises);
      expect(res[0]?.status !== res[1]?.status).toBe(true);
    }
  });
});
//Use Case 4.6
describe("Concurrent add manager", () => {
  it("❎ Two users attempt to add the same manager", async () => {
    for (let i = 0; i < 100; i++) {
      service = new Service();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const id = service.startSession();
      await service.registerMember(id, email, password);
      const uid = await service.loginMember(id, email, password);
      const storeName = generateStoreName();
      const storeId = await service.createStore(uid, storeName);
      const ownermail = "owner@gmail.com";
      const ownerpass = "owner123";
      const oid2 = service.startSession();
      await service.registerMember(oid2, ownermail, ownerpass);
      const oid = await service.loginMember(oid2, ownermail, ownerpass);
      await service.makeStoreOwner(uid, storeId, oid);
      const memail = "member@gmail.com";
      const mpassword = faker.internet.password();
      const mid = service.startSession();
      await service.registerMember(mid, memail, mpassword);
      const umid = await service.loginMember(mid, memail, mpassword);
      async function addM1() {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return service.makeStoreManager(uid, storeId, umid);
      }
      async function addM2() {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return service.makeStoreManager(oid, storeId, umid);
      }
      const promises: Promise<void>[] = [];
      promises.push(addM1());
      promises.push(addM2());
      const res = await Promise.allSettled(promises);
      expect(res[0]?.status !== res[1]?.status).toBe(true);
      expect(await service.isStoreManager(umid, storeId)).toBe(true);
    }
  });
});
//Use Case 4.4
describe("Concurrent add owner", () => {
  it("❎ Two users attempt to add the same owner", async () => {
    for (let i = 0; i < 100; i++) {
      service = new Service();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const id = service.startSession();
      await service.registerMember(id, email, password);
      const uid = await service.loginMember(id, email, password);
      const storeName = generateStoreName();
      const storeId = await service.createStore(uid, storeName);
      const ownermail = "owner@gmail.com";
      const ownerpass = "owner123";
      const oid2 = service.startSession();
      await service.registerMember(oid2, ownermail, ownerpass);
      const oid = await service.loginMember(oid2, ownermail, ownerpass);
      await service.makeStoreOwner(uid, storeId, oid);
      const memail = "member@gmail.com";
      const mpassword = faker.internet.password();
      const mid = service.startSession();
      await service.registerMember(mid, memail, mpassword);
      const umid = await service.loginMember(mid, memail, mpassword);
      async function addO1() {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return service.makeStoreOwner(uid, storeId, umid);
      }
      async function addO2() {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return service.makeStoreOwner(oid, storeId, umid);
      }
      const promises: Promise<void>[] = [];
      promises.push(addO1());
      promises.push(addO2());
      const res = await Promise.allSettled(promises);
      expect(res[0]?.status !== res[1]?.status).toBe(true);
      expect(await service.isStoreOwner(umid, storeId)).toBe(true);
    }
  });
});
//Use Case 3.2
describe("Concurrent store open", () => {
  it("❎ Two users attempt to create store with the same name", async () => {
    for (let i = 0; i < 100; i++) {
      service = new Service();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const id = service.startSession();
      await service.registerMember(id, email, password);
      const uid = await service.loginMember(id, email, password);
      const storeName = generateStoreName();
      const ownermail = "owner@gmail.com";
      const ownerpass = "owner123";
      const oid2 = service.startSession();
      await service.registerMember(oid2, ownermail, ownerpass);
      const oid = await service.loginMember(oid2, ownermail, ownerpass);
      async function addS1() {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return service.createStore(uid, storeName);
      }
      async function addS2() {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return service.createStore(oid, storeName);
      }
      const promises: Promise<string>[] = [];
      promises.push(addS1());
      promises.push(addS2());
      const res = await Promise.allSettled(promises);
      expect(res[0]?.status !== res[1]?.status).toBe(true);
      expect(
        (res[0]?.status === "fulfilled" &&
          (await service.isStoreFounder(uid, res[0]?.value))) ||
          (res[1]?.status === "fulfilled" &&
            (await service.isStoreFounder(oid, res[1]?.value)))
      ).toBe(true);
    }
  });
});

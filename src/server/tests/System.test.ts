import { faker } from "@faker-js/faker/locale/en";
import { generateStoreName } from "server/domain/Stores/_data";
import { Service } from "server/service/Service";
import { describe, expect, it, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

let service: Service;
beforeEach(() => {
  service = new Service();
});

describe("create a new store", () => {
  it("✅creates a store", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    await service.registerMember(id, email, password);
    const uid = await service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = await service.createStore(uid, storeName);
    expect(await service.isStoreFounder(uid, storeId)).toBe(true);
  });
  /* it("❎user is not a member", () => {
     expect(() => new Store("")).toThrow(ZodError);
   });*/
});

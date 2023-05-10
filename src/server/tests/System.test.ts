import { faker } from "@faker-js/faker/locale/en";
import { generateStoreName } from "server/domain/Stores/_data";
import { Service } from "server/service/Service";
import { describe, expect, it, beforeEach } from "vitest";

let service: Service;
beforeEach(() => {
  service = new Service();
});

describe("create a new store", () => {
  it("✅creates a store", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const id = service.startSession();
    service.registerMember(id, email, password);
    const uid = service.loginMember(id, email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    expect(service.isStoreFounder(uid, storeId)).toBe(true);
  });
  /* it("❎user is not a member", () => {
     expect(() => new Store("")).toThrow(ZodError);
   });*/
});

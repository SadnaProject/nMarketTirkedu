import { faker } from "@faker-js/faker/locale/en";
import { beforeEach } from "vitest";
import { describe, expect, it } from "vitest";
import { generateStoreName } from "~/DomainLayer/Stores/Store.test";
import { Service } from "~/ServiceLayer/Service";

let service: Service;
beforeEach(() => {
  service = new Service();
});

describe("create a new store", () => {
  /*  it("✅creates a store", () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    service.register(email, password);
    const uid = service.loginMember(email, password);
    const storeName = generateStoreName();
    const storeId = service.createStore(uid, storeName);
    expect(service.isStoreFounder(uid, storeId)).toBe(true);
  });*/
  // it("❎user is not a member", () => {
  //   expect(() => new Store("")).toThrow(ZodError);
  // });
});

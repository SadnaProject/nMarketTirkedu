// import { faker } from "@faker-js/faker/locale/en";
// import {
//   generateProductArgs,
//   generateStoreName,
// } from "server/data/Stores/helpers/_data";
// import { Service } from "server/service/Service";
// import { describe, expect, it, beforeEach } from "vitest";
// import { TRPCError } from "@trpc/server";
// import { resetDB } from "server/helpers/_Transactional";
// import { type ConditionArgs } from "server/domain/Stores/Conditions/CompositeLogicalCondition/Condition";
// let service: Service;

// export type PaymentDetails = {
//   number: string;
//   month: string;
//   year: string;
//   holder: string;
//   ccv: string;
//   id: string;
// };
// export type DeliveryDetails = {
//   name: string;
//   address: string;
//   city: string;
//   country: string;
//   zip: string;
// };

// //Use Case 4.1
// describe("Stock Management", () => {
//   let email: string,
//     password: string,
//     id: string,
//     uid: string,
//     storeName: string,
//     storeId: string,
//     ownermail: string,
//     ownerpass: string,
//     oid: string,
//     oid2: string,
//     pargs: {
//       name: string;
//       quantity: number;
//       price: number;
//       category: string;
//       description: string;
//     };
//   beforeEach(async () => {
//     await resetDB();
//     service = new Service();
//     email = faker.internet.email();
//     password = faker.internet.password();
//     id = await service.startSession();
//     await service.registerMember(id, email, password);
//     uid = await service.loginMember(id, email, password);
//     storeName = generateStoreName();
//     storeId = await service.createStore(uid, storeName);
//     ownermail = "owner@gmail.com";
//     ownerpass = "owner123";
//     oid2 = await service.startSession();
//     await service.registerMember(oid2, ownermail, ownerpass);
//     oid = await service.loginMember(oid2, ownermail, ownerpass);
//     await service.makeStoreOwner(uid, storeId, oid);
//     pargs = generateProductArgs();
//   });
//   it("✅ Add product to a store", async () => {
//     const pid = await service.createProduct(oid, storeId, pargs);
//     expect(
//       (await service.getProductPrice(uid, pid)) === pargs.price &&
//         (await service.getStoreIdByProductId(uid, pid)) === storeId
//     ).toBe(true);
//   });
//   it("❎ product creation - empty name", async () => {
//     pargs.name = "";
//     await expect(() =>
//       service.createProduct(oid, storeId, pargs)
//     ).rejects.toThrow("Name must be nonempty");
//     const res = await service.searchProducts(uid, {
//       name: pargs.name.toUpperCase().split(" ")[0],
//     });
//     expect(res.keys.length === 0).toBe(true);
//   });

//   it("❎ product creation - gets negative quantity", async () => {
//     pargs.quantity = -1;
//     await expect(() =>
//       service.createProduct(oid, storeId, pargs)
//     ).rejects.toThrow(TRPCError);
//     const res = await service.searchProducts(uid, {
//       name: pargs.name.toUpperCase().split(" ")[0],
//     });
//     expect(res.keys.length === 0).toBe(true);
//   });

//   it("❎ product creation -gets negative price", async () => {
//     pargs.price = -1;
//     await expect(() =>
//       service.createProduct(oid, storeId, pargs)
//     ).rejects.toThrow(TRPCError);
//     const res = await service.searchProducts(uid, {
//       name: pargs.name.toUpperCase().split(" ")[0],
//     });
//     expect(res.keys.length === 0).toBe(true);
//   });
//   it("✅ Update Product Details", async () => {
//     pargs.price = 16;
//     const pid = await service.createProduct(oid, storeId, pargs);
//     await service.setProductPrice(oid, pid, 17);
//     expect((await service.getProductPrice(oid, pid)) === 17).toBe(true);
//   });
//   it("✅ Decrease product quantity within range", async () => {
//     pargs.quantity = 5;
//     const pid = await service.createProduct(oid, storeId, pargs);
//     await service.decreaseProductQuantity(pid, 4);
//     expect(
//       (await service.isProductQuantityInStock(oid, pid, 1)) &&
//         !(await service.isProductQuantityInStock(oid, pid, 2))
//     ).toBe(true);
//   });
//   it("❎ Decrease product quantity exceeding range", async () => {
//     pargs.quantity = 5;
//     const pid = await service.createProduct(oid, storeId, pargs);
//     await expect(() => service.decreaseProductQuantity(pid, 7)).rejects.toThrow(
//       TRPCError
//     );
//     expect(
//       (await service.isProductQuantityInStock(uid, pid, 5)) &&
//         !(await service.isProductQuantityInStock(uid, pid, 6))
//     ).toBe(true);
//   });
// });
// //Use Case 4.4
// describe("Owner Appointment", () => {
//   let email: string,
//     password: string,
//     id: string,
//     uid: string,
//     storeName: string,
//     storeId: string,
//     ownermail: string,
//     ownerpass: string,
//     oid2: string,
//     oid: string;
//   beforeEach(async () => {
//     email = faker.internet.email();
//     password = faker.internet.password();
//     id = await service.startSession();
//     await service.registerMember(id, email, password);
//     uid = await service.loginMember(id, email, password);
//     storeName = generateStoreName();
//     storeId = await service.createStore(uid, storeName);
//     ownermail = "owner@gmail.com";
//     ownerpass = "owner123";
//     oid2 = await service.startSession();
//     await service.registerMember(oid2, ownermail, ownerpass);
//     oid = await service.loginMember(oid2, ownermail, ownerpass);
//     await service.makeStoreOwner(uid, storeId, oid);
//   });
//   it("✅ Successful owner appointment", async () => {
//     expect(await service.isStoreOwner(oid, storeId)).toBe(true);
//   });
//   it("❎ Appointing an already appointed store owner (concurrency)", async () => {
//     const owner2mail = "owner2@gmail.com";
//     const owner2pass = "owner123";
//     const oid22 = await service.startSession();
//     await service.registerMember(oid22, owner2mail, owner2pass);
//     const oid222 = await service.loginMember(oid22, owner2mail, owner2pass);
//     await service.makeStoreOwner(uid, storeId, oid222);
//     await expect(() =>
//       service.makeStoreOwner(oid, storeId, oid222)
//     ).rejects.toThrow(TRPCError);
//     expect(await service.isStoreOwner(oid, storeId)).toBe(true);
//   });
// });
// //Use Case 4.8
// describe("Manager Firing", () => {
//   it("✅ Successful manager firing", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     const managermail = "manager@gmail.com";
//     const managerpass = "owner123";
//     const m2 = await service.startSession();
//     await service.registerMember(m2, managermail, managerpass);
//     const mid = await service.loginMember(m2, managermail, managerpass);
//     await service.makeStoreManager(oid, storeId, mid);
//     await service.removeStoreManager(oid, storeId, mid);
//     expect(await service.isStoreManager(mid, storeId)).toBe(false);
//   });
//   it("❎ firing a non-manager", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     const managermail = "manager@gmail.com";
//     const managerpass = "owner123";
//     const m2 = await service.startSession();
//     await service.registerMember(m2, managermail, managerpass);
//     const mid = await service.loginMember(m2, managermail, managerpass);
//     await service.makeStoreManager(oid, storeId, mid);
//     await service.removeStoreManager(oid, storeId, mid);
//     await expect(() =>
//       service.removeStoreManager(oid, storeId, mid)
//     ).rejects.toThrow(
//       "The user requested to be removed is not a store manager"
//     );
//     expect(await service.isStoreManager(mid, storeId)).toBe(false);
//   });
//   it("❎ Appointing store owner to be a manager", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     const owner2mail = "owner2@gmail.com";
//     const owner2pass = "owner123";
//     const oid22 = await service.startSession();
//     await service.registerMember(oid22, owner2mail, owner2pass);
//     const oid222 = await service.loginMember(oid22, owner2mail, owner2pass);
//     await service.makeStoreOwner(uid, storeId, oid222);
//     await expect(() =>
//       service.makeStoreManager(oid, storeId, oid222)
//     ).rejects.toThrow(
//       "This user cannot be appointed as he is already a position holder in this store"
//     );
//     expect(await service.isStoreOwner(oid222, storeId)).toBe(true);
//   });
// });
// //Use Case 4.7
// describe("Owner Firing", () => {
//   it("✅ Successful owner firing", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     await service.removeStoreOwner(uid, storeId, oid);
//     expect(await service.isStoreOwner(oid, storeId)).toBe(false);
//   });
//   it("❎ firing a non-Owner", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     const managermail = "manager@gmail.com";
//     const managerpass = "owner123";
//     const m2 = await service.startSession();
//     await service.registerMember(m2, managermail, managerpass);
//     const mid = await service.loginMember(m2, managermail, managerpass);
//     await service.makeStoreManager(oid, storeId, mid);
//     await expect(() =>
//       service.removeStoreOwner(oid, storeId, mid)
//     ).rejects.toThrow("The user requested to be removed is not a store owner");
//   });
// });
// //Use Case 4.6
// describe("Manager Appointment", () => {
//   let email: string,
//     password: string,
//     id: string,
//     uid: string,
//     storeName: string,
//     storeId: string,
//     ownermail: string,
//     ownerpass: string,
//     oid2: string,
//     oid: string;
//   beforeEach(async () => {
//     email = faker.internet.email();
//     password = faker.internet.password();
//     id = await service.startSession();
//     await service.registerMember(id, email, password);
//     uid = await service.loginMember(id, email, password);
//     storeName = generateStoreName();
//     storeId = await service.createStore(uid, storeName);
//     ownermail = "owner@gmail.com";
//     ownerpass = "owner123";
//     oid2 = await service.startSession();
//     await service.registerMember(oid2, ownermail, ownerpass);
//     oid = await service.loginMember(oid2, ownermail, ownerpass);
//     await service.makeStoreOwner(uid, storeId, oid);
//   });
//   it("✅ Successful manager appointment", async () => {
//     const managermail = "manager@gmail.com";
//     const managerpass = "owner123";
//     const m2 = await service.startSession();
//     await service.registerMember(m2, managermail, managerpass);
//     const mid = await service.loginMember(m2, managermail, managerpass);
//     await service.makeStoreManager(oid, storeId, mid);
//     expect(await service.isStoreManager(mid, storeId)).toBe(true);
//   });
//   it("❎ appointing an already appointed manager", async () => {
//     const managermail = "manager@gmail.com";
//     const managerpass = "owner123";
//     const m2 = await service.startSession();
//     await service.registerMember(m2, managermail, managerpass);
//     const mid = await service.loginMember(m2, managermail, managerpass);
//     await service.makeStoreManager(oid, storeId, mid);
//     await expect(() =>
//       service.makeStoreManager(oid, storeId, mid)
//     ).rejects.toThrow(TRPCError);
//     expect(await service.isStoreManager(mid, storeId)).toBe(true);
//   });
//   it("❎ Appointing store owner to be a manager", async () => {
//     const owner2mail = "owner2@gmail.com";
//     const owner2pass = "owner123";
//     const oid22 = await service.startSession();
//     await service.registerMember(oid22, owner2mail, owner2pass);
//     const oid222 = await service.loginMember(oid22, owner2mail, owner2pass);
//     await service.makeStoreOwner(uid, storeId, oid222);
//     await expect(() =>
//       service.makeStoreManager(oid, storeId, oid222)
//     ).rejects.toThrow(TRPCError);
//     expect(await service.isStoreOwner(oid222, storeId)).toBe(true);
//     expect(await service.isStoreManager(oid222, storeId)).toBe(false);
//   });
// });
// //Use Case 4.9
// describe("Store Inactivating", () => {
//   it("✅ Successful Case", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     const managermail = "manager@gmail.com";
//     const managerpass = "owner123";
//     const m2 = await service.startSession();
//     await service.registerMember(m2, managermail, managerpass);
//     const mid = await service.loginMember(m2, managermail, managerpass);
//     await service.makeStoreManager(oid, storeId, mid);
//     const mmail = "mem@gmail.com";
//     const mempass = "owner123";
//     const mem2 = await service.startSession();
//     await service.registerMember(mem2, mmail, mempass);
//     const mmid = await service.loginMember(mem2, mmail, mempass);
//     await service.deactivateStore(uid, storeId);
//     expect(
//       !(await service.isStoreActive(uid, storeId)) &&
//         (await service.getNotifications(oid)).length !== 0 &&
//         (await service.getNotifications(mid)).length !== 0 &&
//         (await service.getNotifications(mmid)).length === 0
//     ).toBe(true);
//   });
//   it("❎ Double Inactivating", async () => {
//     const email = faker.internet.email();
//     const password = faker.internet.password();
//     const id = await service.startSession();
//     await service.registerMember(id, email, password);
//     const uid = await service.loginMember(id, email, password);
//     const storeName = generateStoreName();
//     const storeId = await service.createStore(uid, storeName);
//     await service.deactivateStore(uid, storeId);
//     await expect(() => service.deactivateStore(uid, storeId)).rejects.toThrow(
//       TRPCError
//     );
//     expect(await service.isStoreActive(uid, storeId)).toBe(false);
//   });
// });
// //Use Case 4.7
// describe("Update manager permissions", () => {
//   let email: string,
//     password: string,
//     id: string,
//     uid: string,
//     storeName: string,
//     storeId: string,
//     ownermail: string,
//     ownerpass: string,
//     oid2: string,
//     oid: string,
//     managermail: string,
//     managerpass: string,
//     m2: string,
//     mid: string;
//   beforeEach(async () => {
//     email = faker.internet.email();
//     password = faker.internet.password();
//     id = await service.startSession();
//     await service.registerMember(id, email, password);
//     uid = await service.loginMember(id, email, password);
//     storeName = generateStoreName();
//     storeId = await service.createStore(uid, storeName);
//     ownermail = "owner@gmail.com";
//     ownerpass = "owner123";
//     oid2 = await service.startSession();
//     await service.registerMember(oid2, ownermail, ownerpass);
//     oid = await service.loginMember(oid2, ownermail, ownerpass);
//     await service.makeStoreOwner(uid, storeId, oid);
//     managermail = "manager@gmail.com";
//     managerpass = "owner123";
//     m2 = await service.startSession();
//     await service.registerMember(m2, managermail, managerpass);
//     mid = await service.loginMember(m2, managermail, managerpass);
//     await service.makeStoreManager(oid, storeId, mid);
//     await service.setAddingProductToStorePermission(oid, storeId, mid, true);
//   });
//   it("✅ Adding permission", async () => {
//     expect(await service.canCreateProductInStore(mid, storeId)).toBe(true);
//   });
//   it("✅ Removing permission", async () => {
//     await service.setAddingProductToStorePermission(oid, storeId, mid, false);
//     expect(await service.canCreateProductInStore(mid, storeId)).toBe(false);
//   });
// });
// //Use Case 4.13
// describe("Get Purchase History by a store", () => {
//   it("✅ Applied by a store owner", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     const pargs = generateProductArgs();
//     pargs.quantity = 2;
//     const pid = await service.createProduct(oid, storeId, pargs);
//     const memail = "member@gmail.com";
//     const mpassword = faker.internet.password();
//     const mid = await service.startSession();
//     await service.registerMember(mid, memail, mpassword);
//     const umid = await service.loginMember(mid, memail, mpassword);
//     await service.addProductToCart(umid, pid, 1);
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
//     await service.purchaseCart(umid, cCard, d);
//     const pargs2 = generateProductArgs();
//     pargs2.quantity = 3;
//     const pid2 = await service.createProduct(oid, storeId, pargs2);
//     await service.addProductToCart(umid, pid2, 2);
//     await service.purchaseCart(umid, cCard, d);
//     const hist = await service.getPurchasesByStore(oid, storeId);
//     expect(
//       hist.length === 2 &&
//         hist.at(0)?.price === pargs.price &&
//         hist.at(1)?.price === 2 * pargs2.price &&
//         hist.at(0)?.storeId === storeId &&
//         hist.at(1)?.storeId === storeId
//     ).toBe(true);
//   });
//   it("❎ Applied by a regular member", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     const pargs = generateProductArgs();
//     pargs.quantity = 2;
//     const pid = await service.createProduct(oid, storeId, pargs);
//     const memail = "member@gmail.com";
//     const mpassword = faker.internet.password();
//     const mid = await service.startSession();
//     await service.registerMember(mid, memail, mpassword);
//     const umid = await service.loginMember(mid, memail, mpassword);
//     await service.addProductToCart(umid, pid, 1);
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
//     await service.purchaseCart(umid, cCard, d);
//     const pargs2 = generateProductArgs();
//     pargs2.quantity = 3;
//     const pid2 = await service.createProduct(oid, storeId, pargs2);
//     await service.addProductToCart(umid, pid2, 2);
//     await service.purchaseCart(umid, cCard, d);
//     await expect(() =>
//       service.getPurchasesByStore(umid, storeId)
//     ).rejects.toThrow(TRPCError);
//   });
//   it("❎ Applied on non existing store", async () => {
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
//     await expect(() =>
//       service.getPurchasesByStore(oid, storeId)
//     ).rejects.toThrow("Store not found");
//   });
// });
// it("✅ Applied by a founder", async () => {
//   const email = faker.internet.email();
//   const password = faker.internet.password();
//   const id = await service.startSession();
//   await service.registerMember(id, email, password);
//   const uid = await service.loginMember(id, email, password);
//   const storeName = generateStoreName();
//   const storeId = await service.createStore(uid, storeName);
//   const ownermail = "owner@gmail.com";
//   const ownerpass = "owner123";
//   const oid2 = await service.startSession();
//   await service.registerMember(oid2, ownermail, ownerpass);
//   const oid = await service.loginMember(oid2, ownermail, ownerpass);
//   await service.makeStoreOwner(uid, storeId, oid);
//   const pargs = generateProductArgs();
//   pargs.quantity = 2;
//   const pid = await service.createProduct(oid, storeId, pargs);
//   const memail = "member@gmail.com";
//   const mpassword = faker.internet.password();
//   const mid = await service.startSession();
//   await service.registerMember(mid, memail, mpassword);
//   const umid = await service.loginMember(mid, memail, mpassword);
//   await service.addProductToCart(umid, pid, 1);
//   const card = faker.finance.creditCardNumber();
//   const cCard: PaymentDetails = {
//     number: card,
//     ccv: "144",
//     holder: "Buya",
//     id: "111111111",
//     month: "3",
//     year: "2025",
//   };
//   const d: DeliveryDetails = {
//     address: "dsadas",
//     city: "asdasd",
//     country: "sadasd",
//     name: "bsajsa",
//     zip: "2143145",
//   };
//   await service.purchaseCart(umid, cCard, d);
//   const pargs2 = generateProductArgs();
//   pargs2.quantity = 3;
//   const pid2 = await service.createProduct(oid, storeId, pargs2);
//   await service.addProductToCart(umid, pid2, 2);
//   await service.purchaseCart(umid, cCard, d);
//   const hist = await service.getPurchasesByStore(uid, storeId);
//   expect(
//     hist.length === 2 &&
//       hist.at(0)?.price === pargs.price &&
//       hist.at(1)?.price === 2 * pargs2.price &&
//       hist.at(0)?.storeId === storeId &&
//       hist.at(1)?.storeId === storeId
//   ).toBe(true);
// });
// //Use Case 4.11
// describe("Get details/permissions of role holders", () => {
//   it("✅ Adding permission", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     const managermail = "manager@gmail.com";
//     const managerpass = "owner123";
//     const m2 = await service.startSession();
//     await service.registerMember(m2, managermail, managerpass);
//     const mid = await service.loginMember(m2, managermail, managerpass);
//     await service.makeStoreManager(oid, storeId, mid);
//     await service.setAddingProductToStorePermission(oid, storeId, mid, true);
//     expect(await service.canCreateProductInStore(mid, storeId)).toBe(true);
//   });
//   it("✅ Removing permission", async () => {
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
//     await service.makeStoreOwner(uid, storeId, oid);
//     const managermail = "manager@gmail.com";
//     const managerpass = "owner123";
//     const m2 = await service.startSession();
//     await service.registerMember(m2, managermail, managerpass);
//     const mid = await service.loginMember(m2, managermail, managerpass);
//     await service.makeStoreManager(oid, storeId, mid);
//     await service.setAddingProductToStorePermission(oid, storeId, mid, true);
//     await service.setAddingProductToStorePermission(oid, storeId, mid, false);
//     expect(await service.canCreateProductInStore(mid, storeId)).toBe(false);
//   });
// });

// //Use Case 4.2
// describe("Add Constraint", () => {
//   it("✅ Only with 3 bananas", async () => {
//     const cargs: ConditionArgs = {
//       conditionType: "Exactly",
//       type: "Literal",
//       searchFor: "Banana",
//       amount: 3,
//       subType: "Price",
//     };
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
//     pargs2.name = "banana";
//     pargs2.quantity = 5;
//     const pid2 = await service.createProduct(uid, storeId, pargs2);
//     pargs2.name = "tomato";
//     const pid = await service.createProduct(uid, storeId, pargs2);
//     await service.addConstraintToStore(uid, storeId, cargs);
//     await service.createProduct(uid, storeId, pargs2);
//     await service.addProductToCart(oid, "banana", 2);
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
//     await service.addProductToCart(oid, "tomato", 2);
//     await expect(() => service.purchaseCart(oid, cCard, d)).rejects.toThrow(
//       TRPCError
//     );
//     await service.editProductQuantityInCart(oid, "banana", 3);
//     await service.purchaseCart(oid, cCard, d);
//     expect(
//       !(await service.isProductQuantityInStock(uid, pid, 3)) &&
//         (await service.isProductQuantityInStock(uid, pid, 2)) &&
//         !(await service.isProductQuantityInStock(uid, pid2, 3)) &&
//         (await service.isProductQuantityInStock(uid, pid2, 2))
//     ).toBe(true);
//   });
// });

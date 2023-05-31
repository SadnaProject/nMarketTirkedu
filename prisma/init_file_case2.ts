/*
*
REGISTER A USER U1 AS ADMIN

*
REGISTER USERS U2,U3,U4,U5,U6

*
U2 LOGIN

*
U2 OPEN STORE S1

*
U2 ADD ITEM “BAMBA” TO STORE S1 WITH COST 30 AND QUANTITY 20

*
U2 APPOINT U3 TO A STORE MANAGER WITH PERMISSION TO MANAGE INVENTORY.

*
U2 APPOINT U4, U5 TO STORE S1 OWNER

*
U2 LOGS OUT
*/

import { PrismaClient } from "@prisma/client";
import { type StoreProductArgs } from "server/domain/Stores/StoreProduct";
import { getDB } from "server/helpers/_Transactional";
import { Service } from "server/service/Service";

const prisma = new PrismaClient();

const service = new Service();

const admin = {
  email: "admin@gmail.com",
  password: "admin",
};
function getUser(index: number) {
  return {
    email: `u${index}@gmail.com`,
    password: `user${index}`,
  };
}
function getStore(index: number) {
  return {
    name: `s${index}`,
  };
}

async function main() {
  const gId = await service.startSession();
  const u2Id = await service.registerMember(
    gId,
    getUser(2).email,
    getUser(2).password
  );
  const u3Id = await service.registerMember(
    gId,
    getUser(3).email,
    getUser(3).password
  );
  const u4Id = await service.registerMember(
    gId,
    getUser(4).email,
    getUser(4).password
  );
  const u5Id = await service.registerMember(
    gId,
    getUser(5).email,
    getUser(5).password
  );
  const u6Id = await service.registerMember(
    gId,
    getUser(6).email,
    getUser(6).password
  );
  await service.loginMember(gId, getUser(2).email, getUser(2).password);
  const storeId = await service.createStore(u2Id, getStore(1).name);
  await service.createProduct(u2Id, storeId, {
    name: "Bamba",
    price: 30,
    quantity: 20,
    category: "Snacks",
    description: "Bamba is a peanut butter-flavored snack.",
  });
  await service.makeStoreManager(u2Id, storeId, u3Id);
  await service.setAddingProductToStorePermission(u2Id, storeId, u3Id, true);
  await service.setRemovingProductFromStorePermission(
    u2Id,
    storeId,
    u3Id,
    true
  );
  await service.setEditingProductInStorePermission(u2Id, storeId, u3Id, true);
  await service.makeStoreOwner(u2Id, storeId, u4Id);
  await service.makeStoreOwner(u2Id, storeId, u5Id);
  await service.logoutMember(u2Id);
}

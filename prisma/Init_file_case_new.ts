/**
 * Adds seed data to your db.
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
/**
 *  Register U1 (system admin), U2, U3, U4, U5
*  U2 logs in and opens a new store S
*  U2 adds a new product "Apple" with cost=20 and quantity=10.
* U2 logs out

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

/**
  Users: u1, u2, u3. u1 is founder of store s1. u1 appoint u2 as s1 store owner. 
  u2 appoint u3 as s1 store owner.
  */
async function main() {
  const gId = await service.startSession();
  const u1Id = await service.registerMember(
    gId,
    getUser(1).email,
    getUser(1).password
  );
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
  await service.loginMember(gId, getUser(2).email, getUser(2).password);
  const storeId = await service.createStore(u2Id, "s");
  // await service.makeStoreOwner(u1Id, storeId, u2Id);
  // const approveStoreOwner = await service.makeStoreOwner(u2Id, storeId, u3Id);
  // await service.approveStoreOwner(approveStoreOwner, u1Id);
  await service.createProduct(u2Id, storeId, {
    name: "Apple",
    price: 20,
    quantity: 10,
    category: "Fruit",
    description: "Fresh apple",
  });
  await service.disconnectUser(u2Id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

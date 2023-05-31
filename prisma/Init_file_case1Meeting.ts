/**
 * Adds seed data to your db.
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
/**
 The system needs to be ready for the next script(+ an acceptance test for it✅):
  *Our comment: this is after admin was created in the previous script.
  Users: u1, u2, u3. u1 is founder of store s1. u1 appoint u2 as s1 store owner. 
  u2 appoint u3 as s1 store owner.
  
  u3 tries to remove u2 – expected failure
  u1 removes u2 – expected success.
  Expected results: u3 is removed. How?
  Expected flow: u1 🡪 ‘u1-u2-Ownership-appointment’ 🡪 s1 & u2
  🡪 u2.remove-owner(u3,s1)` 
   
   
   
   
   Scenario test: visiting members info II.6.6 -> remove member II.6.2

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
  await service.loginMember(gId, getUser(1).email, getUser(1).password);
  await service.createStore(u1Id, getStore(1).name);
  await service.makeStoreOwner(u1Id, getStore(1).name, u2Id);
  await service.makeStoreOwner(u2Id, getStore(1).name, u3Id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

/**
 * Adds seed data to your db.
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from "@prisma/client";
import { type StoreProductArgs } from "server/domain/Stores/StoreProduct";
import { getDB } from "server/helpers/_Transactional";
import { Service } from "server/service/Service";

const prisma = new PrismaClient();

const service = new Service();

const jonas = {
  email: "jonas@dark.com",
  password: "jonas@dark.com",
};
const admin = {
  email: "admin@gmail.com",
  password: "admin",
};

const storeName = "I wish you would";
const product = {
  name: "St. Christopher medal",
  category: "Jewelry",
  description: "A medal of St. Christopher, the patron saint of travelers.",
  price: 10.99,
  quantity: 5,
} satisfies StoreProductArgs;
const martha = {
  email: "martha@dark.com",
  password: "martha@dark.com",
};

async function seedMartha() {
  const id = await service.startSession();
  await service.registerMember(id, martha.email, martha.password);
}

async function seedJonas() {
  const id = await service.startSession();
  await service.registerMember(id, jonas.email, jonas.password);
  const uid = await service.loginMember(id, jonas.email, jonas.password);
  const storeId = await service.createStore(uid, storeName);
  await service.createProduct(uid, storeId, product);
  await service.makeStoreOwner(uid, storeId, martha.email);
  await service.logoutMember(uid);
}
async function seedAdmin() {
  const id = await service.startSession();
  const uid = await service.registerMember(id, admin.email, admin.password);
  // await service.loginMember(id, admin.email, admin.password);
  await service.disconnectUser(id);
  await getDB().admin.create({ data: { userId: uid } });
}

async function main() {
  await seedAdmin();
  // await service.logoutMember(uid);
  // await seedMartha();
  // await seedJonas();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

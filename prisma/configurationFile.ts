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

const admin = {
  email: "admin@gmail.com",
  password: "admin",
};

async function seedAdmin() {
  const id = await service.startSession();
  const uid = await service.registerMember(id, admin.email, admin.password);
  // await service.loginMember(id, admin.email, admin.password);
  await service.disconnectUser(id);
  await getDB().admin.create({ data: { userId: uid } });
}

async function main() {
  await seedAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

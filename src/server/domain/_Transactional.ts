/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-types */
import "reflect-metadata";
import { dbGlobal } from "server/db";
import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";
import { z } from "zod";
import { type Prisma, type PrismaClient } from "@prisma/client";

const asyncLocalStorage = new AsyncLocalStorage();

type TransactionalPrisma = Omit<
  PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
>;

const dbMap = new Map<string, TransactionalPrisma>();

export function getDB() {
  const id = z.string().parse(asyncLocalStorage.getStore());
  const db = dbMap.get(id);
  if (!db) throw new Error("No db found");
  return db;
}

export function transactional(target: { prototype: Object }) {
  const prototype = target.prototype;
  // for each method
  for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
    const isMethod = descriptor?.value instanceof Function;
    if (!isMethod) continue;

    const originalMethod = descriptor.value as { apply: Function };
    descriptor.value = async function (...args: unknown[]) {
      //  const MAX_RETRIES = 5
      //   let retries = 0
      //   while (retries < MAX_RETRIES) {
      //     try {
      //       return await prisma.$transaction(...)
      //     } catch (error) {
      //       if (error.code === 'P2034') {
      //         retries++
      //         continue
      //       }
      //       throw error
      //     }
      //   }
      try {
        getDB(); // check if db exists, i.e. we are in a transaction
        return await originalMethod.apply(this, args);
      } catch (e) {
        return dbGlobal.$transaction(async (db) => {
          const id = randomUUID();
          dbMap.set(id, db);
          const result = await asyncLocalStorage.run(id, async () => {
            return await originalMethod.apply(this, args);
          });
          dbMap.delete(id);
          return result;
        });
      }
    };

    Object.defineProperty(prototype, propertyName, descriptor);
  }
}

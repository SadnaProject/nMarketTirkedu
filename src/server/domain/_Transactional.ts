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
import { getContext, runWithContext } from "./_Context";

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
  const context = z.object({ dbId: z.string() }).safeParse(getContext());
  if (context.success) {
    const db = dbMap.get(context.data.dbId);
    if (!db) {
      throw new Error("No db found inside transaction");
    }
    return db;
  }
  return dbGlobal;
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
      if (getDB() === dbGlobal) {
        return dbGlobal.$transaction(async (db) => {
          const id = randomUUID();
          dbMap.set(id, db);
          const result = await runWithContext({ dbId: id }, async () => {
            return await originalMethod.apply(this, args);
          });
          dbMap.delete(id);
          return result;
        });
      }
      return await originalMethod.apply(this, args);
    };

    Object.defineProperty(prototype, propertyName, descriptor);
  }
}

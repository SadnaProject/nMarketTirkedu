import "reflect-metadata";
import { db } from "server/db";

//! create prisma extension that saves prisma before each method and sets it back after each method
//! therefore, no other blocking methods are allowed

export function transactional(target: { prototype: Object }) {
  const prototype = target.prototype;
  // for each method
  for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
    const isMethod = descriptor?.value instanceof Function;
    if (!isMethod) continue;

    const originalMethod = descriptor.value as { apply: Function };
    descriptor.value = async function (...args: any[]) {
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
      return await db.$transaction((db) => {
        return originalMethod.apply(this, args);
      });
    };

    Object.defineProperty(prototype, propertyName, descriptor);
  }
}

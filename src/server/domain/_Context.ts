/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import "reflect-metadata";
import { AsyncLocalStorage } from "async_hooks";

const asyncLocalStorage = new AsyncLocalStorage();

export async function getContext() {
  const context = await asyncLocalStorage.getStore();
  if (context instanceof Object) {
    return context;
  }
  return {};
}

export async function runWithContext<T>(context: Object, fn: () => Promise<T>) {
  return asyncLocalStorage.run({ ...(await getContext()), ...context }, fn);
}

export function hasContext(target: { prototype: Object }) {
  const prototype = target.prototype;
  // for each method
  for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
    const isMethod = descriptor?.value instanceof Function;
    if (!isMethod) continue;

    const originalMethod = descriptor.value as { apply: Function };
    descriptor.value = async function (...args: unknown[]) {
      // make sure context is provided
      if (!("context" in this && this.context instanceof Object)) {
        throw new Error("Context not provided");
      }
      const context = await getContext();

      return asyncLocalStorage.run(
        { ...context, ...this.context },
        async () => {
          return await originalMethod.apply(this, args);
        }
      );
    };

    Object.defineProperty(prototype, propertyName, descriptor);
  }
}

export class HasContext {
  private context: Object = {};

  resetContext() {
    this.context = {};
    return this;
  }

  addContext(context: Object) {
    this.context = { ...this.context, ...context };
    return this;
  }
}

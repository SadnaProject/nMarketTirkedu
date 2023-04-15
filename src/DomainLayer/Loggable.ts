/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
type Log = { name: string; args: any[] };

export function loggable(target: { prototype: any }) {
  const prototype = target.prototype;
  for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
    const isMethod = descriptor?.value instanceof Function;
    if (!isMethod) continue;

    const originalMethod = descriptor.value as { apply: any };
    descriptor.value = function (...args: any[]) {
      if ("logs" in this && this.logs instanceof Array) {
        this.logs.push({
          name: propertyName,
          args,
        } satisfies Log);
      }
      try {
        return originalMethod.apply(this, args);
      } catch (e) {
        if ("errors" in this && this.errors instanceof Array) {
          this.errors.push(e);
        }
        throw e;
      }
    };

    Object.defineProperty(prototype, propertyName, descriptor);
  }
}

export class Loggable {
  private logs: Log[] = [];
  private errors: Error[] = [];

  protected get Logs() {
    return this.logs;
  }

  protected get Errors() {
    return this.errors;
  }
}

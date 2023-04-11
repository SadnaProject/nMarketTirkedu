/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export function testable(target: { prototype: any }) {
  const prototype = target.prototype;
  for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
    const isMethod = descriptor?.value instanceof Function;
    if (!isMethod) continue;

    const originalMethod = descriptor.value as { apply: any };
    descriptor.value = function (...args: any[]) {
      if ("isTesting" in this && this.isTesting) {
        throw new Error(
          `Test code needs to be fixed - function ${String(
            propertyName
          )} should be mocked`
        );
      }
      return originalMethod.apply(this, args);
    };

    Object.defineProperty(prototype, propertyName, descriptor);
  }
}

export class Testable {
  private isTesting = false;

  test() {
    this.isTesting = true;
    return this;
  }
}

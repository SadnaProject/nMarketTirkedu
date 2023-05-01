/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import "reflect-metadata";
const censoredMetadataKey = Symbol("censored");

export function censored(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  const existingCensoredParameters: number[] =
    Reflect.getOwnMetadata(censoredMetadataKey, target, propertyKey) || [];
  existingCensoredParameters.push(parameterIndex);
  Reflect.defineMetadata(
    censoredMetadataKey,
    existingCensoredParameters,
    target,
    propertyKey
  );
}

export function loggable(target: { prototype: Object }) {
  const prototype = target.prototype;
  for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
    const isMethod = descriptor?.value instanceof Function;
    if (!isMethod) continue;

    const originalMethod = descriptor.value as { apply: Function };
    descriptor.value = function (...args: any[]) {
      const censoredParameters: number[] =
        Reflect.getOwnMetadata(
          censoredMetadataKey,
          target.prototype,
          propertyName
        ) || [];
      const censoredArgs = args.map((arg, i) => {
        return censoredParameters.includes(i) ? "*censored*" : arg;
      });

      if (!("logs" in this && this.logs instanceof Array)) {
        throw new Error("Loggable class must have a logs property");
      }
      if (!("errors" in this && this.errors instanceof Array)) {
        throw new Error("Loggable class must have an errors property");
      }
      try {
        const res = originalMethod.apply(this, args);
        this.logs.push({
          name: propertyName,
          args: censoredArgs,
          error: null,
        } satisfies Log);
        return res;
      } catch (e) {
        if (!(e instanceof TRPCError) && !(e instanceof ZodError)) {
          this.errors.push(e);
        } else {
          this.logs.push({
            name: propertyName,
            args: censoredArgs,
            error: e,
          } satisfies Log);
        }
        throw e;
      }
    };

    Object.defineProperty(prototype, propertyName, descriptor);
  }
}

type Log = { name: string; args: any[]; error: Error | null };

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

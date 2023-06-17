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
  // for each method
  for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
    const isMethod = descriptor?.value instanceof Function;
    if (!isMethod) continue;

    const originalMethod = descriptor.value as { apply: Function };
    descriptor.value = function (...args: any[]) {
      // censor args
      const censoredParameters: number[] =
        Reflect.getOwnMetadata(
          censoredMetadataKey,
          target.prototype,
          propertyName
        ) || [];
      const censoredArgs = args.map((arg, i) => {
        return censoredParameters.includes(i) ? "*censored*" : arg;
      });
      // make sure logs and errors exist
      if (!("logs" in this && this.logs instanceof Array)) {
        throw new Error("Loggable class must have a logs property");
      }
      if (!("errors" in this && this.errors instanceof Array)) {
        throw new Error("Loggable class must have an errors property");
      }
      // run method
      try {
        const res = originalMethod.apply(this, args);
        // log success
        this.logs.push({
          name: propertyName,
          args: censoredArgs,
          error: null,
          time: new Date(),
        } satisfies Log);
        return res;
      } catch (e) {
        const log = {
          name: propertyName,
          args: censoredArgs,
          error: e,
          time: new Date(),
        } satisfies Log;
        // log error
        this.logs.push(log);
        if (!(e instanceof TRPCError) && !(e instanceof ZodError)) {
          // log unexpected error
          this.errors.push(log);
        }
        throw e;
      }
    };

    Object.defineProperty(prototype, propertyName, descriptor);
  }
}

type Log = { name: string; args: any[]; error: any; time: Date };

export class Loggable {
  private logs: Log[] = [];
  private errors: Log[] = [];

  protected get Logs() {
    return this.logs;
  }

  protected get Errors() {
    return this.errors;
  }
}

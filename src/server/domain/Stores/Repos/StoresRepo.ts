import { Testable, testable } from "server/domain/_Testable";
import { Store } from "../Store";
import { TRPCError } from "@trpc/server";
import { db } from "server/db";
import {
  ConditionArgs,
  ICondition,
} from "../Conditions/CompositeLogicalCondition/Condition";
import { ConstraintPolicy } from "../PurchasePolicy/ConstraintPolicy";
import { buildCondition } from "../Conditions/CompositeLogicalCondition/_typeDictionary";
import { DiscountPolicy } from "../DiscountPolicy/DiscountPolicy";
import { DiscountArgs } from "../DiscountPolicy/Discount";
import { type Store as DataStore } from "@prisma/client";

@testable
export class StoresRepo extends Testable {
  private stores: Store[];

  constructor() {
    super();
    this.stores = [];
  }

  public async addStore(store: Store) {
    await db.store.create({
      data: {
        name: store.Name,
        isActive: store.IsActive(),
      },
    });
  }
  public async getAllNames() {
    const stores = await db.store.findMany({
      select: {
        name: true,
      },
    });
    return new Set(stores.map((store) => store.name));
  }

  public async getAllStores() {
    const stores = await db.store.findMany();
    const realStores = [];
    for (const store of stores) {
      const realStore = await this.getStoreById(store.id);
      realStores.push(realStore);
    }
    return realStores;
  }

  public async getActiveStores() {
    const stores = await db.store.findMany({
      where: {
        isActive: true,
      },
    });
    return stores;
  }

  public async getStoreById(storeId: string) {
    const store = await db.store.findUnique({
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }
    const realStore = new Store(store.name);
    realStore.Id = store.id;
    await realStore.setActive(store.isActive);
    realStore.DiscountPolicy = await this.getDiscounts(storeId);
    realStore.ConstraintPolicy = await this.getConstraints(storeId);
    return realStore;
  }
  public async getConstraints(storeId: string): Promise<ConstraintPolicy> {
    const constraints = await db.constraint.findMany({
      where: {
        id: storeId,
      },
    });
    const constraintPolicy = new ConstraintPolicy(storeId);
    for (const constraint of constraints) {
      const conditionArgs = await this.getCondition(constraint.conditionId);
      constraintPolicy.addConstraint(conditionArgs);
    }
    return constraintPolicy;
  }
  public async getDiscounts(storeId: string): Promise<DiscountPolicy> {
    const discounts = await db.discount.findMany({
      where: {
        id: storeId,
      },
    });
    const discountPolicy = new DiscountPolicy(storeId);
    for (const discount of discounts) {
      const discountArgs = await this.getDiscountArgs(discount.id);
      discountPolicy.addDiscount(discountArgs);
    }
    return discountPolicy;
  }
  private async getDiscountArgs(discountId: string): Promise<DiscountArgs> {
    const discount = await db.discount.findUnique({
      where: {
        id: discountId,
      },
      include: {
        composite: true,
        simple: true,
      },
    });
    if (discount?.composite) {
      const first = await this.getDiscountArgs(discount?.composite.leftId);
      const second = await this.getDiscountArgs(discount?.composite.rightId);
      return {
        type: discount?.composite.type,
        left: first,
        right: second,
      };
    } else {
      if (!discount?.simple) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Discount not found",
        });
      }
      return {
        type: "Simple",
        discountOn: discount?.simple.discountOn,
        amount: discount?.simple.amount,
        condition: await this.getCondition(discount?.simple.conditionId),
      };
    }
  }
  private async getCondition(conditionId: string): Promise<ConditionArgs> {
    const condition = await db.condition.findUnique({
      where: {
        id: conditionId,
      },
      include: {
        compositeCondition: true,
        dateCondition: true,
        LiteralCondition: true,
      },
    });
    if (condition?.compositeCondition) {
      const first = await this.getCondition(
        condition?.compositeCondition.firstId
      );
      const second = await this.getCondition(
        condition?.compositeCondition.secondId
      );
      return {
        type: "Composite",
        left: first,
        right: second,
        subType: condition?.compositeCondition.CompositeConditionType,
      };
    } else if (condition?.dateCondition) {
      return {
        type: "Time",
        conditionType: condition?.dateCondition.timeConditionType,
        year: condition?.dateCondition.year ?? undefined,
        month: condition?.dateCondition.month ?? undefined,
        day: condition?.dateCondition.day ?? undefined,
        hour: condition?.dateCondition.hour ?? undefined,
      };
    } else if (condition?.LiteralCondition) {
      return {
        type: "Literal",
        subType: condition?.LiteralCondition.type,
        amount: condition?.LiteralCondition.amount ?? undefined,
        conditionType: condition?.LiteralCondition.conditionType,
        searchFor: "",
      };
    }
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Condition not found",
    });
  }

  public async deleteStore(storeId: string) {
    await db.store.delete({
      where: {
        id: storeId,
      },
    });
  }
  public async addConstraint(storeId: string, condition: ConditionArgs) {
    return (
      await db.constraint.create({
        data: {
          storeId: storeId,
          conditionId: await this.addCondition(condition),
        },
      })
    ).id;
  }
  public async addDiscount(
    storeId: string,
    discount: DiscountArgs
  ): Promise<string> {
    if (discount.type === "Simple") {
      const simple = await db.simpleDiscount.create({
        data: {
          amount: discount.amount,
          discountOn: discount.discountOn,
          storeId: storeId,
          conditionId: await this.addCondition(discount.condition),
        },
      });
      return (
        await db.discount.create({
          data: {
            simpleId: simple.id,
            storeId: storeId,
          },
        })
      ).id;
    } else {
      if (discount.type === "Add" || discount.type === "Max") {
        const composite = await db.compositeDiscount.create({
          data: {
            leftId: await this.addDiscount(storeId, discount.left),
            rightId: await this.addDiscount(storeId, discount.right),
            type: discount.type,
          },
        });
        return (
          await db.discount.create({
            data: {
              compositeId: composite.id,
              storeId: storeId,
            },
          })
        ).id;
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Discount type not supported",
      });
    }
  }
  public async addCondition(condition: ConditionArgs): Promise<string> {
    if (condition.type === "Composite") {
      return (
        await db.condition.create({
          data: {
            compositeCondition: {
              create: {
                firstId: await this.addCondition(condition.left),
                secondId: await this.addCondition(condition.right),
                CompositeConditionType: condition.subType,
              },
            },
          },
        })
      ).id;
    } else if (condition.type === "Time") {
      return (
        await db.condition.create({
          data: {
            dateCondition: {
              create: {
                timeConditionType: condition.conditionType,
                year: condition.year,
                month: condition.month,
                day: condition.day,
                hour: condition.hour,
              },
            },
          },
        })
      ).id;
    } else {
      if (condition.type === "Literal") {
        return (
          await db.condition.create({
            data: {
              LiteralCondition: {
                create: {
                  type: condition.subType,
                  amount: condition.amount,
                  conditionType: condition.conditionType,
                },
              },
            },
          })
        ).id;
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Condition is not from correct type",
        });
      }
    }
  }
  public setField<T extends keyof DataStore>(
    productId: string,
    field: T,
    value: DataStore[T]
  ) {
    return db.store.update({
      where: {
        id: productId,
      },
      data: {
        [field]: value,
      },
    });
  }
  public async removeConstraint(constraintId: string) {
    const constraint = await db.constraint.findUnique({
      where: {
        id: constraintId,
      },
    });
    return await db.condition.delete({
      where: {
        id: constraint?.conditionId,
      },
    });
  }
  public async removeDiscount(discountId: string) {}
}

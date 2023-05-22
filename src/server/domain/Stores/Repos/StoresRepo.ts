import { db } from "server/db";
import { Testable, testable } from "server/domain/_Testable";
import { TRPCError } from "@trpc/server";
import { type Store as DataStore } from "@prisma/client";
import { type ConditionArgs } from "../Conditions/CompositeLogicalCondition/Condition";
import { ConstraintPolicy } from "../PurchasePolicy/ConstraintPolicy";
import { DiscountPolicy } from "../DiscountPolicy/DiscountPolicy";
import { type DiscountArgs } from "../DiscountPolicy/Discount";

@testable
export class StoresRepo extends Testable {
  constructor() {
    super();
  }

  public async addStore(storeName: string) {
    return await db.store.create({
      data: {
        name: storeName,
        isActive: true,
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
    return store;
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
      constraintPolicy.addConstraint(conditionArgs, constraint.conditionId);
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
      discountPolicy.addDiscount(discountArgs, discount.id);
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
    await this.deleteConditions(storeId);
    await this.deleteDiscounts(storeId);
    await this.deleteConstraints(storeId);
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
    if (!constraint) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Constraint not found",
      });
    }
    return await this.deleteConditions(constraint?.conditionId);
  }
  public async removeDiscount(discountId: string) {
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
      await this.removeDiscount(discount?.composite.leftId);
      await this.removeDiscount(discount?.composite.rightId);
      await db.compositeDiscount.delete({
        where: {
          id: discount?.composite.id,
        },
      });
    } else if (discount?.simple) {
      await this.deleteConditions(discount?.simple.conditionId);
      await db.simpleDiscount.delete({
        where: {
          id: discount?.simple.id,
        },
      });
    }
  }
  private async deleteConditions(conditionId: string) {
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
      await this.deleteConditions(condition?.compositeCondition.firstId);
      await this.deleteConditions(condition?.compositeCondition.secondId);
      await db.compositeCondition.delete({
        where: {
          id: condition?.compositeCondition.id,
        },
      });
    } else if (condition?.LiteralCondition) {
      await db.literalCondition.delete({
        where: {
          id: condition?.LiteralCondition.id,
        },
      });
    } else if (condition?.dateCondition) {
      await db.dateCondition.delete({
        where: {
          id: condition?.dateCondition.id,
        },
      });
    }
  }
  private async deleteDiscounts(storeId: string) {
    const discounts = await db.discount.findMany({
      where: {
        storeId: storeId,
      },
      include: {
        composite: true,
        simple: true,
      },
    });
    for (const discount of discounts) {
      await this.removeDiscount(discount.id);
    }
  }
  private async deleteConstraints(storeId: string) {
    const constraints = await db.constraint.findMany({
      where: {
        storeId: storeId,
      },
    });
    for (const constraint of constraints) {
      await this.removeConstraint(constraint.id);
    }
  }
}

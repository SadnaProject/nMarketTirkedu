import { getDB } from "server/domain/_Transactional";
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

  public async addStore(storeName: string, storeId: string) {
    return await getDB().store.create({
      data: {
        name: storeName,
        id: storeId,
        isActive: true,
      },
    });
  }
  public async getAllNames() {
    const stores = await getDB().store.findMany({
      select: {
        name: true,
      },
    });
    return new Set(stores.map((store) => store.name));
  }

  public async getAllStores() {
    const stores = await getDB().store.findMany();
    const realStores = [];
    for (const store of stores) {
      const realStore = await this.getStoreById(store.id);
      realStores.push(realStore);
    }
    return realStores;
  }

  public async getActiveStores() {
    const stores = await getDB().store.findMany({
      where: {
        isActive: true,
      },
    });
    return stores;
  }

  public async getStoreById(storeId: string) {
    const store = await getDB().store.findUnique({
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
    const constraints = await getDB().constraint.findMany({
      where: {
        id: storeId,
      },
    });
    const constraintPolicy = new ConstraintPolicy(storeId);
    for (const constraint of constraints) {
      const conditionArgs = await getDB().condition.findFirst({
        where: {
          constraintId: constraint.id,
        },
      });
      if (!conditionArgs) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Condition not found",
        });
      }
      constraintPolicy.addConstraint(
        await this.getCondition(conditionArgs.id),
        constraint.id
      );
    }
    return constraintPolicy;
  }
  public async getDiscounts(storeId: string): Promise<DiscountPolicy> {
    const discounts = await getDB().discount.findMany({
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
    const discount = await getDB().discount.findUnique({
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
      const conditionArgs = await getDB().condition.findFirst({
        where: {
          discountId: discountId,
        },
      });
      if (!conditionArgs) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Condition not found",
        });
      }
      return {
        type: "Simple",
        discountOn: discount?.simple.discountOn,
        amount: discount?.simple.amount,
        condition: await this.getCondition(conditionArgs?.id),
      };
    }
  }
  private async getCondition(conditionId: string): Promise<ConditionArgs> {
    const condition = await getDB().condition.findUnique({
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
    await this.deleteDiscounts(storeId);
    await this.deleteConstraints(storeId);
    await getDB().store.delete({
      where: {
        id: storeId,
      },
    });
  }
  public async addConstraint(storeId: string, condition: ConditionArgs) {
    const constraint = await getDB().constraint.create({
      data: {
        storeId: storeId,
      },
    });
    await this.addCondition(condition, constraint.id, undefined);
    return constraint.id;
  }
  private async addDiscountAndKeepHierarchy(
    discount: DiscountArgs,
    storeId?: string
  ): Promise<string> {
    if (discount.type === "Simple") {
      const simple = await getDB().simpleDiscount.create({
        data: {
          amount: discount.amount,
          discountOn: discount.discountOn,
        },
      });
      await this.addCondition(discount.condition, undefined, simple.id);
      return (
        await getDB().discount.create({
          data: {
            simpleId: simple.id,
            storeId: storeId,
          },
        })
      ).id;
    } else {
      if (discount.type === "Add" || discount.type === "Max") {
        const composite = await getDB().compositeDiscount.create({
          data: {
            leftId: await this.addDiscountAndKeepHierarchy(discount.left),
            rightId: await this.addDiscountAndKeepHierarchy(discount.right),
            type: discount.type,
          },
        });
        return (
          await getDB().discount.create({
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

  public async addDiscount(
    storeId: string,
    discount: DiscountArgs
  ): Promise<string> {
    return await this.addDiscountAndKeepHierarchy(discount, storeId);
  }
  private async addConditionAndKeepHierarchy(
    condition: ConditionArgs,
    constraintId?: string,
    discountId?: string
  ): Promise<string> {
    if (condition.type === "Composite") {
      const composite = await getDB().compositeCondition.create({
        data: {
          firstId: await this.addConditionAndKeepHierarchy(condition.left),
          secondId: await this.addConditionAndKeepHierarchy(condition.right),
          CompositeConditionType: condition.subType,
        },
      });
      return (
        await getDB().condition.create({
          data: {
            constraintId: constraintId,
            discountId: discountId,
            compositeConditionId: composite.id,
          },
        })
      ).id;
    } else if (condition.type === "Time") {
      const dateCondition = await getDB().dateCondition.create({
        data: {
          timeConditionType: condition.conditionType,
          year: condition.year ?? undefined,
          month: condition.month ?? undefined,
          day: condition.day ?? undefined,
          hour: condition.hour ?? undefined,
        },
      });

      return (
        await getDB().condition.create({
          data: {
            constraintId: constraintId,
            discountId: discountId,
            dateConditionId: dateCondition.id,
          },
        })
      ).id;
    } else {
      if (condition.type === "Literal") {
        const literalCondition = await getDB().literalCondition.create({
          data: {
            type: condition.subType,
            amount: condition.amount ?? undefined,
            conditionType: condition.conditionType,
          },
        });
        return (
          await getDB().condition.create({
            data: {
              constraintId: constraintId,
              discountId: discountId,
              LiteralConditionId: literalCondition.id,
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
  public async addCondition(
    condition: ConditionArgs,
    constraintId?: string,
    discountId?: string
  ): Promise<string> {
    return await this.addConditionAndKeepHierarchy(
      condition,
      constraintId,
      discountId
    );
  }
  public setField<T extends keyof DataStore>(
    id: string,
    field: T,
    value: DataStore[T]
  ) {
    return getDB().store.update({
      where: {
        id: id,
      },
      data: {
        [field]: value,
      },
    });
  }
  public async removeConstraint(constraintId: string) {
    const conditions = await getDB().condition.findMany({
      where: {
        constraintId: constraintId,
      },
    });
    for (const condition of conditions)
      await this.deleteConditions(condition.id);

    await getDB().constraint.delete({
      where: {
        id: constraintId,
      },
    });
  }
  public async removeDiscount(discountId: string) {
    const discount = await getDB().discount.findUnique({
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
      await getDB().discount.delete({
        where: {
          id: discountId,
        },
      });
      await getDB().compositeDiscount.delete({
        where: {
          id: discount?.composite.id,
        },
      });
    } else if (discount?.simple) {
      const conditions = await getDB().condition.findMany({
        where: {
          discountId: discount?.simple.id,
        },
      });
      for (const condition of conditions) {
        await this.deleteConditions(condition.id);
      }
      await getDB().discount.delete({
        where: {
          id: discountId,
        },
      });
      await getDB().simpleDiscount.delete({
        where: {
          id: discount?.simple.id,
        },
      });
    }
  }
  private async deleteConditions(conditionId: string) {
    const condition = await getDB().condition.findUnique({
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
      await getDB().condition.delete({
        where: {
          id: conditionId,
        },
      });
      await getDB().compositeCondition.delete({
        where: {
          id: condition?.compositeCondition.id,
        },
      });
    } else if (condition?.LiteralCondition) {
      const LiteralConditionId = condition?.LiteralCondition.id;
      await getDB().condition.delete({
        where: {
          id: conditionId,
        },
      });
      await getDB().literalCondition.delete({
        where: {
          id: LiteralConditionId,
        },
      });
    } else if (condition?.dateCondition) {
      await getDB().condition.delete({
        where: {
          id: conditionId,
        },
      });
      const dateConditionId = condition?.dateCondition.id;
      await getDB().dateCondition.delete({
        where: {
          id: dateConditionId,
        },
      });
    }
  }
  private async deleteDiscounts(storeId: string) {
    const discounts = await getDB().discount.findMany({
      where: {
        storeId: storeId,
      },
    });
    for (const discount of discounts) {
      await this.removeDiscount(discount.id);
    }
  }
  private async deleteConstraints(storeId: string) {
    const constraints = await getDB().constraint.findMany({
      where: {
        storeId: storeId,
      },
    });
    for (const constraint of constraints) {
      await this.removeConstraint(constraint.id);
    }
  }
}

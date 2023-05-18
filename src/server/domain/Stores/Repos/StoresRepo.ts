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
    return stores;
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
    realStore.setActive(store.isActive);
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

    constraints.forEach((constraint) => {
      this.getCondition(constraint.conditionId)
        .then((conditionArgs) => {
          constraintPolicy.addConstraint(conditionArgs);
        })
        .catch((err) => {
          throw err;
        });
    });
    return constraintPolicy;
  }
  public async getDiscounts(storeId: string): Promise<DiscountPolicy> {
    const discounts = await db.discount.findMany({
      where: {
        id: storeId,
      },
    });
    const discountPolicy = new DiscountPolicy(storeId);
    discounts.forEach((discount) => {
      this.getDiscountArgs(discount.id)
        .then((discountArgs) => {
          discountPolicy.addDiscount(discountArgs);
        })
        .catch((err) => {
          throw err;
        });
    });
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
}

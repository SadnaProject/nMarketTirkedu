import { randomUUID } from "crypto";
import { type ConditionArgs } from "../Conditions/CompositeLogicalCondition/Condition";
import { type FullBasketDTO } from "../StoresController";
import { TRPCError } from "@trpc/server";
import { Constraint } from "./Constraint";

export class ConstraintPolicy {
  private storeId: string;
  private constraints: Map<string, Constraint>;
  constructor(storeId: string) {
    this.storeId = storeId;
    this.constraints = new Map<string, Constraint>();
  }
  public addConstraint(args: ConditionArgs) {
    const constraintID = randomUUID();
    this.constraints.set(constraintID, new Constraint(args));
    return constraintID;
  }
  public isSatisfiedBy(basket: FullBasketDTO) {
    return this.constraints.size === 0
      ? true
      : Array.from(this.constraints.values()).every((constraint) =>
          constraint.isSatisfiedBy(basket)
        );
  }
  public removeConstraint(constraintID: string) {
    const constraint = this.constraints.get(constraintID);
    if (constraint === undefined)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested constraint not found",
      });
    this.constraints.delete(constraintID);
  }
}

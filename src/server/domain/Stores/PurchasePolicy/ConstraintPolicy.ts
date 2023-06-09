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
  public addConstraint(args: ConditionArgs, constraintID: string) {
    this.constraints.set(constraintID, new Constraint(args));
    return constraintID;
  }
  public isSatisfiedBy(basket: FullBasketDTO) {
    if (this.constraints.size === 0) return true;
    for (const constraint of this.constraints.values()) {
      if (!constraint.isSatisfiedBy(basket)) return false;
    }
    return true;
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
  public getConstraints() {
    const constraintsArgs = new Map<string, ConditionArgs>();
    this.constraints.forEach((constraint, constraintID) => {
      constraintsArgs.set(constraintID, constraint.getArgs());
    });
    return constraintsArgs;
  }
}

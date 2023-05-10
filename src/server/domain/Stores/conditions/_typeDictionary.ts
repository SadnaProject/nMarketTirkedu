import { ANDCondition } from "./ANDCondition";
import { ImpliesCondition } from "./ImpliesCondition";
import { XORCondition } from "./XORCondition";
import { ORCondition } from "./ORCondition";
import { LiteralCondition } from "./LiteralCondition";
import { ConditionArgs, ICondition } from "./Condition";
export const typeToClass = {
  And: ANDCondition,
  Or: ORCondition,
  Xor: XORCondition,
  Implies: ImpliesCondition,
};
export function build(args: ConditionArgs): ICondition {
  const type = args.type;
  if (type === "Literal") return new LiteralCondition(args);
  const conditionClass = typeToClass[type];
  return new conditionClass(args);
}

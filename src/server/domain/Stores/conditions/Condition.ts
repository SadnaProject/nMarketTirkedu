import { z } from "zod";
import { type FullBasketDTO } from "../StoresController";
const ConditionOnSchema = z.enum(["Product", "Category", "Basket"]);
export type Condition_on = z.infer<typeof ConditionOnSchema>;
const ConditionTypeSchema = z.enum(["AtLeast", "AtMost", "Exactly"]);
export type Condition_Type = z.infer<typeof ConditionTypeSchema>;
export const literalSchema = z.object({
  condition_on: ConditionOnSchema,
  condition_type: ConditionTypeSchema,
  amount: z.number(),
  search_For: z.string(),
  type: z.literal("Literal"),
});
export type LiteralArgs = z.infer<typeof literalSchema>;

export const compositeSchema = z.object({
  left: z.lazy(() => conditionSchema),
  right: z.lazy(() => conditionSchema),
  type: z.enum(["And", "Or", "Xor", "Implies"]),
});
export interface CompositeArgs {
  left: ConditionArgs;
  right: ConditionArgs;
  type: "And" | "Or" | "Xor" | "Implies";
}

export type ConditionArgs = LiteralArgs | CompositeArgs;
const conditionSchema: z.ZodType<ConditionArgs> = z.union([
  literalSchema,
  compositeSchema,
]);
export interface ICondition {
  isSatisfiedBy(basket: FullBasketDTO): boolean;
}

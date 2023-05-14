import { z } from "zod";
import { type FullBasketDTO } from "../../StoresController";
export const ConditionTypeSchema = z.enum(["AtLeast", "AtMost", "Exactly"]);
export type conditionType = z.infer<typeof ConditionTypeSchema>;
export const TimeConditionTypeSchema = z.enum(["Before", "At", "After"]);
export type TimeConditionType = z.infer<typeof TimeConditionTypeSchema>;

const subTypeLiteralSchema = z.enum(["Product", "Category", "Store", "Price"]);
export type SubTypeLiteral = z.infer<typeof subTypeLiteralSchema>;
const subTypeCompositeSchema = z.enum(["And", "Or", "Xor", "Implies"]);
export type SubTypeComposite = z.infer<typeof subTypeCompositeSchema>;
export const literalSchema = z.object({
  conditionType: ConditionTypeSchema,
  amount: z.number(),
  searchFor: z.string(),
  subType: subTypeLiteralSchema,
  type: z.literal("Literal"),
});
export interface LiteralArgs {
  conditionType: conditionType;
  amount: number;
  searchFor: string;
  subType: SubTypeLiteral;
  type: "Literal";
}
export const compositeSchema = z.object({
  left: z.lazy(() => conditionSchema),
  right: z.lazy(() => conditionSchema),
  subType: subTypeCompositeSchema,
  type: z.literal("Composite"),
});
export interface CompositeArgs {
  left: ConditionArgs;
  right: ConditionArgs;
  subType: SubTypeComposite;
  type: "Composite";
}
export const timeConditionTypeSchema = z.object({
  year: z.number().optional(),
  month: z.number().optional(),
  day: z.number().optional(),
  hour: z.number().optional(),
  timeCondition: TimeConditionTypeSchema,
  type: z.literal("Time"),
  subType: z.literal("Time"),
});

export interface TimeArgs {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  timeCondition: TimeConditionType;
  type: "Time";
  subType: "Time";
}
export type ConditionArgs = LiteralArgs | CompositeArgs | TimeArgs;
export const conditionSchema: z.ZodType<ConditionArgs> = z.union([
  literalSchema,
  compositeSchema,
  timeConditionTypeSchema,
]);
export interface ICondition {
  isSatisfiedBy(basket: FullBasketDTO): boolean;
}

import { z } from "zod";
import { type FullBasketDTO } from "../../StoresController";
export const ConditionOnSchema = z.enum(["Product", "Category", "Basket"]);
export type Condition_on = z.infer<typeof ConditionOnSchema>;
export const ConditionTypeSchema = z.enum(["AtLeast", "AtMost", "Exactly"]);
export type Condition_Type = z.infer<typeof ConditionTypeSchema>;
export const TimeConditionTypeSchema = z.enum(["Before", "At", "After"]);
export type TimeCondition_Type = z.infer<typeof TimeConditionTypeSchema>;

export const literalSchema = z.object({
  condition_on: ConditionOnSchema,
  condition_type: ConditionTypeSchema,
  amount: z.number(),
  search_For: z.string(),
  subType: z.enum(["Product", "Category", "Store", "Price"]),
  type: z.literal("Literal"),
});
export interface LiteralArgs {
  condition_type: Condition_Type;
  amount: number;
  search_For: string;
  subType: "Product" | "Category" | "Store" | "Price";
  type: "Literal";
}
export const compositeSchema = z.object({
  left: z.lazy(() => conditionSchema),
  right: z.lazy(() => conditionSchema),
  subType: z.enum(["And", "Or", "Xor", "Implies"]),
  type: z.literal("Composite"),
});
export interface CompositeArgs {
  left: ConditionArgs;
  right: ConditionArgs;
  subType: "And" | "Or" | "Xor" | "Implies";
  type: "Composite";
}
export const timeConditionTypeSchema = z.object({
  year: z.number().optional(),
  month: z.number().optional(),
  day: z.number().optional(),
  hour: z.number().optional(),
  subType: z.enum(["TimeOnStore", "TimeOnProduct", "TimeOnCategory"]),
  search_For: z.string().optional(),
  amount: z.number().optional(),
  condition_type: ConditionTypeSchema,
  timeCondition: TimeConditionTypeSchema,
  type: z.literal("Time"),
});

export interface TimeArgs {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  search_For?: string;
  amount?: number;
  subType: "TimeOnStore" | "TimeOnProduct" | "TimeOnCategory";
  condition_type: Condition_Type;
  timeCondition: TimeCondition_Type;
  type: "Time";
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

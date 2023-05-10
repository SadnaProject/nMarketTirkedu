import { z } from "zod";
import { type FullBasketDTO } from "../StoresController";
import { LiteralConditionSchema } from "./LiteralCondition";

export interface ICondition {
  isSatisfiedBy(basket: FullBasketDTO): boolean;
}

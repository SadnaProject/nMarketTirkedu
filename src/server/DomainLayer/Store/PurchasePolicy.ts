import { type Constraint } from "./Constraint";

export class PurchasePolicy {
  private constraints: Constraint[];

  constructor() {
    this.constraints = [];
  }
}

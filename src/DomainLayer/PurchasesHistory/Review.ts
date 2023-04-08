import { randomUUID } from "crypto";

export type ReviewDTO = {
  userId : string;
  id: string;
  rating: number;
  createdAt: Date;
  storeId? : string;
  purchaseId? : string;
};

export type ReviewArgs = {
  rating: number;
};

export class Review {
  private id: string;
  private rating: number;
  private createdAt: Date;
  private userId: string;
  private purchaseId: string;
  private storeId?: string;
  private productId?: string;

  // create constructor for either store review or purchase review
  constructor(args: ReviewArgs, userId: string, purchaseId: string, storeId: string, productId: string) {
    this.id = randomUUID();
    this.rating = args.rating;
    this.createdAt = new Date();
    this.userId = userId;
    this.purchaseId = purchaseId;
    if(storeId === "") {
      if (productId === "") {
        throw new Error("storeId and productId are both undefined");
      }
      this.productId = productId;
    }
    else if(productId === "") {
      this.storeId = storeId;
    }
    else {
      throw new Error("storeId and productId are both defined");
    }
    
  }

  public get Id(): string {
    return this.id;
  }

  public get Rating(): number {
    return this.rating;
  }

  public get CreatedAt(): Date {
    return this.createdAt;
  }
}

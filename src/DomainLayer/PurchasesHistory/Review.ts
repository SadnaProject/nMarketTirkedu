import { randomUUID } from "crypto";
import { HasRepos } from "./HasRepos";

export type ReviewDTO = {
  userId: string;
  id: string;
  rating: number;
  createdAt: Date;
  productId?: string;
  storeId?: string;
  purchaseId?: string;
};

export type ReviewArgs = {
  rating: number;
  id: string;
  createdAt: Date;
  userId: string;
  purchaseId: string;
  storeId?: string;
  productId?: string;
};

export class Review extends HasRepos {
  private id: string;
  private rating: number;
  private createdAt: Date;
  private userId: string;
  private purchaseId: string;
  private storeId?: string;
  private productId?: string;

  // create constructor for either store review or purchase review
  constructor(args: ReviewArgs) {
    super();
    this.id = args.id;
    this.rating = args.rating;
    this.createdAt = args.createdAt;
    this.userId = args.userId;
    this.purchaseId = args.purchaseId;
    if (this.rating < 1 || this.rating > 5) {
      throw new Error("Rating must be between 1-5");
    }
    if (args.storeId === undefined) {
      if (args.productId === undefined) {
        throw new Error("storeId and productId are both undefined");
      }
      this.productId = args.productId;
    } else if (args.productId === undefined) {
      this.storeId = args.storeId;
    } else {
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

  public ReviewToDTO(): ReviewDTO {
    return {
      id: this.id,
      rating: this.rating,
      createdAt: this.createdAt,
      userId: this.userId,
      purchaseId: this.purchaseId,
      storeId: this.storeId,
      productId: this.productId,
    };
  }
  public get UserId(): string {
    return this.userId;
  }

  public get PurchaseId(): string {
    return this.purchaseId;
  }
  public get StoreId(): string | undefined {
    return this.storeId;
  }
  public get ProductId(): string | undefined {
    return this.productId;
  }

}

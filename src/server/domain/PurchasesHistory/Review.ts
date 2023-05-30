import { ReviewDAO } from "./helpers/TypeHelper";
import { HasRepos } from "./helpers/_HasRepos";
import { TRPCError } from "@trpc/server";

export type ReviewDTO = {
  userId: string;
  rating: number;
  createdAt: Date;
  storeId: string;
  purchaseId: string;
};

export type ReviewArgs = {
  rating: number;
  createdAt: Date;
  userId: string;
  purchaseId: string;
  storeId: string;
};

export class Review {
  private rating: number;
  private createdAt: Date;
  private userId: string;
  private purchaseId: string;
  private storeId: string;

  // create constructor for either store review or purchase review
  constructor(args: ReviewArgs) {
    // super();
    this.rating = args.rating;
    this.createdAt = args.createdAt;
    this.userId = args.userId;
    this.purchaseId = args.purchaseId;
    this.storeId = args.storeId;
    if (this.rating < 1 || this.rating > 5) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Rating must be between 1 and 5, but was: " + this.rating.toString(),
      });
    }
  }

  public get Rating(): number {
    return this.rating;
  }

  public get CreatedAt(): Date {
    return this.createdAt;
  }

  public ReviewToDTO(): ReviewDTO {
    return {
      rating: this.rating,
      createdAt: this.createdAt,
      userId: this.userId,
      purchaseId: this.purchaseId,
      storeId: this.storeId,
    };
  }

  public static fromDAO(reviewDAO: ReviewDAO): Review {
    return new Review({
      rating: reviewDAO.rating,
      createdAt: reviewDAO.createdAt,
      userId: reviewDAO.userId,
      purchaseId: reviewDAO.purchaseId,
      storeId: reviewDAO.storeId,
    });
  }
  public get UserId(): string {
    return this.userId;
  }

  public get PurchaseId(): string {
    return this.purchaseId;
  }
  public get StoreId(): string {
    return this.storeId;
  }
}

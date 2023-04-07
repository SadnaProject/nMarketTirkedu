import { randomUUID } from "crypto";

export type ReviewDTO = {
  id: string;
  rating: number;
  createdAt: Date;
};

export type ReviewArgs = {
  rating: number;
};

export class Review {
  private id: string;
  private rating: number;
  private createdAt: Date;

  constructor({ rating }: ReviewArgs) {
    this.id = randomUUID();
    this.rating = rating;
    this.createdAt = new Date();
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

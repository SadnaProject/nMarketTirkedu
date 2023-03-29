import { Review, type ReviewArgs, type ReviewDTO } from "./Review";

export type ProductReviewDTO = {
  title: string;
  description: string;
} & ReviewDTO;

export type ProductReviewArgs = {
  title: string;
  description: string;
} & ReviewArgs;

export class ProductReview extends Review {}

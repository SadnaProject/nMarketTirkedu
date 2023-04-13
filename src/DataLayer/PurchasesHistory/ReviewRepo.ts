import { ReviewDTO } from "~/DomainLayer/PurchasesHistory/Review";


export class ReviewRepo{
    private Reviews : ReviewDTO[];

    constructor(){
        this.Reviews = [];
    }
    public Review(ProductReview : ReviewDTO){
        this.Reviews.push(ProductReview);
    }
    public getStoreReview(purchaseId: string, storeId: string): ReviewDTO | undefined {
        return this.Reviews.find((review) => review.purchaseId === purchaseId && review.storeId === storeId);
    }
    public getAllStoreReviews(storeId: string): ReviewDTO[] {
        return this.Reviews.filter((review) => review.storeId === storeId);
    }
    public addStoreReview(review: ReviewDTO): void {
        this.Reviews.push(review);
    }

}
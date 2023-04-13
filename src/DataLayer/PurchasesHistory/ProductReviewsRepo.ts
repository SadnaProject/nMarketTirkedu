import { ProductReviewDTO } from "~/DomainLayer/PurchasesHistory/ProductReview";


export class ProductReviewRepo{
    private ProductReviews : ProductReviewDTO[];

    constructor(){
        this.ProductReviews = [];
    }
    public addProductReview(ProductReview : ProductReviewDTO){
        this.ProductReviews.push(ProductReview);
    }
    public getProductReview(purchaseId: string, productId: string): ProductReviewDTO | undefined {
        return this.ProductReviews.find((review) => review.purchaseId === purchaseId && review.productId === productId);
    }

    public getAllProductReviews(productId: string): ProductReviewDTO[] {
        return this.ProductReviews.filter((review) => review.productId === productId);
    }
}
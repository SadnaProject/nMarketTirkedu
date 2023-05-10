//! can be session object or JWT validator - TBD
//TODO decide if we need to use JWT or not
//for now we will use a simple session object
export class Session {
  invalidate() {
    //set expiration date to now minus one minute
    this.expirationDateTime = new Date(new Date().getTime() - 60000);
  }
  public sessionId: string;
  public userId: string;
  public expirationDateTime: Date;
  constructor(userId: string) {
    this.sessionId = "";
    this.userId = userId;
    this.expirationDateTime = this.generateExpirationDate();
  }
  private generateExpirationDate(): Date {
    return new Date("2500-01-01"); //! TBD, as their is no expiration date for now
  }
  public get SessionId(): string {
    return this.sessionId;
  }
  public get UserId(): string {
    return this.userId;
  }
  public get ExpirationDateTime(): Date {
    return this.expirationDateTime;
  }
  public set ExpirationDateTime(expirationDateTime: Date) {
    this.expirationDateTime = expirationDateTime;
  }
  public updateExpirationDate(): void {
    this.expirationDateTime = this.generateExpirationDate(); //! TBD - should we add a time to the current date?
  }
  public isValid(): boolean {
    return this.expirationDateTime > new Date();
  }
}

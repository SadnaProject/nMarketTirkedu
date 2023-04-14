import { Session } from "./Session";


export type UserType = "GUEST" | "MEMBER";

export type UserAuthDTO = {
  userId: string;
  email: string;
  password: string;
  type: UserType;
  sessions: Session[];
};
export class UserAuth {
  private userId: string;
  private email: string;
  private password: string;
  private type: UserType;
  private sessions: Session[];

  constructor(userId: string, type: UserType, email: string, password: string) {
    this.userId = userId;
    this.type = type;
    this.email = email;
    this.password = password;
    this.sessions = [];
  }

  public get UserId(): string {
    return this.userId;
  }

  public get Email(): string {
    return this.email;
  }

  private addSession(session: Session): void {
    this.sessions.push(session);
  }

  public isLoggedIn(): boolean {
    const latestSession = this.getLatestSession();
    if (latestSession === undefined) {
      return false;
    }
    return latestSession.isValid();
  }
  private getLatestSession(): Session | undefined {
    if (this.sessions.length === 0) {
      return undefined;
    }
    return this.sessions[this.sessions.length - 1];
  }
}

import { Session } from "./Session";
const {randomUUID} = await import("crypto");
import { z } from "zod";


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

  constructor(type: UserType, email: string, password: string) {
    this.userId = randomUUID();
    this.type = type;
    this.validateEmailLegality(email);
    this.email = email;
    this.validatePasswordLegality(password);
    this.password = password;
    this.sessions = [];
  }
  private validatePasswordLegality(password: string): void {
    z.string().parse(password);
  }
  private validateEmailLegality(email: string): void {
    z.string().email().parse(email);
  }
    
  public get UserId(): string {
    return this.userId;
  }

  public get Email(): string {
    return this.email;
  }
  public get DTO(): UserAuthDTO {
    return {
      userId: this.userId,
      email: this.email,
      password: this.password,
      type: this.type,
      sessions: this.sessions,
    };
  }

  private addSession(session: Session): void {
    this.sessions.push(session);
  }

  public isConnectionValid(): boolean {
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

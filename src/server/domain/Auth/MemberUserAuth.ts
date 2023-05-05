import { Session } from "./Session";
import { z } from "zod";
import { UserAuth, type UserAuthDTO } from "./UserAuth";
import { TRPCError } from "@trpc/server";

export type MemberUserAuthDTO = {
  email: string;
  password: string;
} & UserAuthDTO;
export class MemberUserAuth extends UserAuth {
  private email: string;
  private password: string;

  private constructor() {
    super("MEMBER");
    this.email = "";
    this.password = "";
  }
  public get Email(): string {
    return this.email;
  }
  public set Email(email: string) {
    this.validateEmailLegality(email);
    this.email = email;
  }
  public set Password(password: string) {
    this.validatePasswordLegality(password);
    this.password = password;
  }
  public static create(email: string, password: string): MemberUserAuth {
    const memberUserAuth = new MemberUserAuth();
    memberUserAuth.validateEmailLegality(email);
    memberUserAuth.email = email;
    memberUserAuth.validatePasswordLegality(password);
    memberUserAuth.password = password;
    return memberUserAuth;
  }
  public static createFromDTO(dto: MemberUserAuthDTO): MemberUserAuth {
    const memberUserAuth = new MemberUserAuth();
    memberUserAuth.userId = dto.userId;
    memberUserAuth.email = dto.email;
    memberUserAuth.password = dto.password;
    memberUserAuth.type = dto.type;
    memberUserAuth.sessions = dto.sessions;
    return memberUserAuth;
  }
  private validatePasswordLegality(password: string): void {
    // z.string().parse(password);
    return;
  }
  private validateEmailLegality(email: string): void {
    if (email === "admin") return;
    z.string().email().parse(email);
  }
  public isPasswordCorrect(password: string): boolean {
    return this.password === password;
  }

  public get DTO(): MemberUserAuthDTO {
    return {
      userId: this.userId,
      email: this.email,
      password: this.password,
      type: this.type,
      sessions: this.sessions,
    };
  }

  protected addSession(session: Session): void {
    this.sessions.push(session);
  }

  public login(): Session {
    if (this.isUserLoggedInAsMember()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Member is already logged in",
      });
    }
    const session = new Session(this.userId);
    this.addSession(session);
    return session;
  }
  public logout(): void {
    const latestSession = this.getLatestSession();
    if (latestSession === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No session to logout from",
      });
    }
    if (latestSession.isValid() === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The member is not logged in",
      });
    }
    latestSession.invalidate();
  }
  //Logged in= has a valid session as a member
  //Connected= has a valid session as a guest or a member
  public isUserLoggedInAsMember(): boolean {
    return this.isConnectionValid();
  }
  public isUserLoggedInAsGuest(): boolean {
    return false;
  }
}

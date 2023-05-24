import { Session } from "./Session";
import { z } from "zod";
import { UserAuth, type UserAuthDTO } from "./UserAuth";
import { TRPCError } from "@trpc/server";
import { createCipheriv, randomBytes, pbkdf2Sync } from "crypto";
export type MemberUserAuthDTO = {
  email: string;
  password: string;
  isLoggedIn: boolean;
  // salt: string;
} & UserAuthDTO;
export class MemberUserAuth extends UserAuth {
  private email: string;
  private password: string;
  private salt: string;

  private constructor() {
    super("MEMBER");
    this.email = "";
    this.password = "";
    this.salt = "8e7cd3841781edbdd8c2ee4438cdea61"; //TODO change this to a random string
    // this.salt = randomBytes(16).toString("hex");
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
    this.password = this.encryptPassword(password);
  }
  public get Password(): string {
    return this.password;
  }
  public static create(email: string, password: string): MemberUserAuth {
    const memberUserAuth = new MemberUserAuth();
    memberUserAuth.validateEmailLegality(email);
    memberUserAuth.email = email;
    memberUserAuth.validatePasswordLegality(password);
    memberUserAuth.Password = password;
    return memberUserAuth;
  }
  public static createFromDTO(dto: MemberUserAuthDTO): MemberUserAuth {
    const memberUserAuth = new MemberUserAuth();
    memberUserAuth.userId = dto.id;
    memberUserAuth.email = dto.email;
    memberUserAuth.password = dto.password;
    if (dto.type !== undefined) {
      memberUserAuth.type = dto.type;
    }
    // memberUserAuth.type = dto.type;
    if (dto.sessions !== undefined) {
      memberUserAuth.sessions = dto.sessions;
    }
    memberUserAuth.isLoggedIn = dto.isLoggedIn;

    return memberUserAuth;
  }

  private validatePasswordLegality(password: string): void {
    // z.string().parse(password);
    return;
  }
  private validateEmailLegality(email: string): void {
    if (email === "admin") return; // todo remove
    z.string().email().parse(email);
  }
  public isPasswordCorrect(password: string): boolean {
    return this.password === this.encryptPassword(password);
  }

  public get DTO(): MemberUserAuthDTO {
    return {
      id: this.userId,
      email: this.email,
      password: this.password,
      type: this.type,
      sessions: this.sessions,
      // salt: this.salt,
    };
  }

  protected addSession(session: Session): void {
    this.sessions.push(session);
  }

  public async login(): Promise<Session> {
    if (this.isUserLoggedInAsMember()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Member is already logged in",
      });
    }
    console.log("Member is logging in");
    await this.setIsLoggedIn(true);
    const session = new Session(this.userId);
    this.addSession(session);
    return session;
  }
  public async reConnect(): Promise<void> {
    await this.setIsLoggedIn(true);
  }
  public async logout(): Promise<void> {
    console.log("Member is logging out");

    if (!this.isUserLoggedInAsMember()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Member is not logged in",
      });
    } else {
      await this.setIsLoggedIn(false);
    }
  }

  //Logged in= has a valid session as a member
  //Connected= has a valid session as a guest or a member
  public isUserLoggedInAsMember(): boolean {
    return this.isLoggedIn;
  }
  public isUserLoggedInAsGuest(): boolean {
    return false;
  }
  private encryptPassword(password: string): string {
    return pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
  }
}

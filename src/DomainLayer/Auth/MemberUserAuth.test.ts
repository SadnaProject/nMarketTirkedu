import { beforeEach, describe, expect, it } from "vitest";
import { type Repos, createTestRepos } from "./HasRepos";
import { MemberUserAuth } from "./MemberUserAuth";
import { GuestUserAuth } from "./GuestUserAuth";

export function createMember(name: string,password: string) {
    return MemberUserAuth.create(name, password);
}
function getMemberI(i: number): MemberUserAuth {
    return MemberUserAuth.create("user" + i.toString() + "@email.com", "password" + i.toString());
}
function getGuestI(i: number): GuestUserAuth {
    return GuestUserAuth.create();
}
describe("create member", () => {
    it("✅creates member", () => {
        const member = MemberUserAuth.create("user1@gmail.com", "password1");
        expect(member).not.toBeNull();
        expect(member.Email).toEqual("user1@gmail.com");
        expect(member.isPasswordCorrect("password1")).toBeTruthy();
    });
    it("❎does not create member with invalid email", () => {
        expect(() => MemberUserAuth.create("user1gmail.com", "password1")).toThrow();
    });
} );


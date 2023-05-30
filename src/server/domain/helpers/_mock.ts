import { it, vi } from "vitest";

export function itUnitIntegration(
  name: string,
  fn: (testType: string) => Promise<void> | void
) {
  it(`${name} (unit)`, async () => {
    await fn("unit");
  });
  it(`${name} (integration)`, async () => {
    vi.spyOn(vi, "spyOn").mockReturnValue(vi.fn());
    await fn("integration");
  });
}

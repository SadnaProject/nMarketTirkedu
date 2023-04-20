import { it, vi } from "vitest";

export function itUnitIntegration(
  name: string,
  fn: (testType: string) => void
) {
  it(`${name} (unit)`, () => {
    fn("unit");
  });
  it(`${name} (integration)`, () => {
    vi.spyOn(vi, "spyOn").mockReturnValue(vi.fn());
    fn("integration");
  });
}

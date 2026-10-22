import { describe, expect, it } from "vitest";
import { STEPS, getActions, isValidWeight } from "@/lib/teg";

function actions(index: number, weight: number) {
  const step = STEPS[index];
  if (!step) throw new Error(`Missing step ${index}`);
  return getActions(step, "paed", weight);
}

describe("Paediatric weight-based doses", () => {
  it("requires a finite positive weight", () => {
    expect(isValidWeight(0)).toBe(false);
    expect(isValidWeight(-10)).toBe(false);
    expect(isValidWeight(Infinity)).toBe(false);
    expect(isValidWeight(NaN)).toBe(false);
    expect(isValidWeight(2.5)).toBe(true);
  });
  it("calculates cryoprecipitate at 5 mL/kg", () => {
    expect(actions(0, 20)[0]).toContain("100 mL total");
    expect(actions(0, 2.5)[0]).toContain("12.5 mL total");
  });
  it("calculates fibrinogen at 40 mg/kg without assuming a concentration", () => {
    expect(actions(0, 20)[1]).toContain("800 mg total");
  });
  it("calculates platelets at 10 mL/kg and retains the bag limit", () => {
    expect(actions(1, 20)[0]).toContain("200 mL total");
    expect(actions(1, 20)[0]).toContain("max 1 bag");
  });
  it("calculates plasma at 15 mL/kg and retains the bag limit", () => {
    expect(actions(2, 20)[0]).toContain("300 mL total");
    expect(actions(2, 20)[0]).toContain("max 2 bags");
    expect(actions(2, 20)[1]).toBe("PCC is for adults only");
  });
  it("calculates both tranexamic acid doses at 15 mg/kg with a 1 g maximum each", () => {
    for (const dose of actions(3, 20)) expect(dose).toContain("300 mg total");
    for (const dose of actions(3, 80)) expect(dose).toContain("1000 mg total (maximum applied)");
  });
  it("leaves adult doses unchanged", () => {
    for (const step of STEPS) expect(getActions(step, "adult", 20)).toEqual(step.action.adult);
  });
});
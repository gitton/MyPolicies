import { addYears } from "@/utils/addYears";

describe("addYears", () => {
  it("should add years to a date", () => {
    const date = new Date("2025-10-16");
    const years = 1;
    const newDate = addYears(date, years);
    expect(newDate.getDate()).toBe(16);
    expect(newDate.getMonth()).toBe(9);
    expect(newDate.getFullYear()).toBe(2026);
  });
});

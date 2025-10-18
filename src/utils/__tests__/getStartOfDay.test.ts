import { getStartOfDay } from "@/utils/getStartOfDay";

describe("getStartOfDay", () => {
  it("should return the start of the day (00:00:00.000) for a given date", () => {
    const date = new Date("2025-10-25T15:45:30.500Z");
    const startOfDay = getStartOfDay(date);

    expect(startOfDay.getHours()).toBe(0);
    expect(startOfDay.getMinutes()).toBe(0);
    expect(startOfDay.getSeconds()).toBe(0);
    expect(startOfDay.getMilliseconds()).toBe(0);
  });

  it("should preserve the date (day, month, year) in the local timezone", () => {
    const date = new Date("2025-10-25T15:45:30.500");
    const startOfDay = getStartOfDay(date);

    expect(startOfDay.getDate()).toBe(date.getDate());
    expect(startOfDay.getMonth()).toBe(date.getMonth());
    expect(startOfDay.getFullYear()).toBe(date.getFullYear());
  });

  it("should not modify the original date object", () => {
    const originalDate = new Date("2025-10-25T15:45:30.500Z");
    const originalTime = originalDate.getTime();

    getStartOfDay(originalDate);

    expect(originalDate.getTime()).toBe(originalTime);
  });

  it("should handle dates that are already at the start of the day", () => {
    const date = new Date("2025-10-25T00:00:00.000Z");
    const startOfDay = getStartOfDay(date);

    expect(startOfDay.getHours()).toBe(0);
    expect(startOfDay.getMinutes()).toBe(0);
    expect(startOfDay.getSeconds()).toBe(0);
    expect(startOfDay.getMilliseconds()).toBe(0);
  });
});

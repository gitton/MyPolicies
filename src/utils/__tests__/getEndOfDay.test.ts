import { getEndOfDay } from "@/utils/getEndOfDay";

describe("getEndOfDay", () => {
  it("should return the end of the day (23:59:59.999) for a given date", () => {
    const date = new Date("2025-10-25T15:45:30.500Z");
    const endOfDay = getEndOfDay(date);

    expect(endOfDay.getHours()).toBe(23);
    expect(endOfDay.getMinutes()).toBe(59);
    expect(endOfDay.getSeconds()).toBe(59);
    expect(endOfDay.getMilliseconds()).toBe(999);
  });

  it("should preserve the date (day, month, year) in the local timezone", () => {
    const date = new Date("2025-10-25T15:45:30.500");
    const endOfDay = getEndOfDay(date);

    expect(endOfDay.getDate()).toBe(date.getDate());
    expect(endOfDay.getMonth()).toBe(date.getMonth());
    expect(endOfDay.getFullYear()).toBe(date.getFullYear());
  });

  it("should not modify the original date object", () => {
    const originalDate = new Date("2025-10-25T15:45:30.500Z");
    const originalTime = originalDate.getTime();

    getEndOfDay(originalDate);

    expect(originalDate.getTime()).toBe(originalTime);
  });

  it("should handle dates that are already at the end of the day", () => {
    const date = new Date("2025-10-25T23:59:59.999Z");
    const endOfDay = getEndOfDay(date);

    expect(endOfDay.getHours()).toBe(23);
    expect(endOfDay.getMinutes()).toBe(59);
    expect(endOfDay.getSeconds()).toBe(59);
    expect(endOfDay.getMilliseconds()).toBe(999);
  });
});

import { formatDateToShortMonth } from "@/utils/formatDateToShortMonth";

describe("formatDateToShortMonth", () => {
  it("should format date to DD MMM YYYY", () => {
    const date = new Date("2025-10-16");
    const formattedDate = formatDateToShortMonth(date);
    expect(formattedDate).toBe("16 Oct 2025");
  });
});

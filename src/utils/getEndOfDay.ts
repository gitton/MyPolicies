/**
 * Returns a new Date object set to the end of the day (23:59:59.999)
 * in the local timezone.
 *
 * @param date The date to get the end of day for
 * @returns A new Date object set to 23:59:59.999 of the same day
 */
export const getEndOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

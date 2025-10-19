/**
 * Returns a new Date object set to the beginning of the day (00:00:00.000)
 * in the local timezone.
 *
 * @param date The date to get the start of day for
 * @returns A new Date object set to 00:00:00.000 of the same day
 */
export const getStartOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

import { AppError } from './AppError';

export interface DayRange {
  startOfDay: Date;
  endOfDay: Date;
}

export const getDayRangeFromTimestamp = (rawTimestamp: string | number): DayRange => {
  const numericVal = Number(rawTimestamp);
  const date = !isNaN(numericVal) ? new Date(numericVal) : new Date(rawTimestamp);

  if (isNaN(date.getTime())) {
    throw new AppError('Invalid dateTimestamp provided. Please supply a valid timestamp or ISO date string', 400);
  }

  // Calculate UTC start of day (00:00:00.000)
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  // Calculate UTC end of day (23:59:59.999)
  const endOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999
  ));

  return { startOfDay, endOfDay };
};
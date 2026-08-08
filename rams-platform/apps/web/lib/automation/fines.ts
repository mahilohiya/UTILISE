import type { FineRule } from "@rams/database";

export function calculateFine(
  dueDate: Date,
  returnDate: Date,
  rule: Pick<FineRule, "perDayAmount" | "gracePeriodDays" | "maxFineCap">
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLate = Math.floor(
    (returnDate.getTime() - dueDate.getTime()) / msPerDay
  );
  if (daysLate <= rule.gracePeriodDays) return 0;
  const chargeableDays = daysLate - rule.gracePeriodDays;
  const fine = chargeableDays * rule.perDayAmount;
  return Math.min(fine, rule.maxFineCap);
}

export function isOverdue(dueDate: Date, now = new Date()) {
  return now > dueDate;
}

export function getNextReservationHoldExpiry(hours = 24) {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

export interface DemandAlert {
  bookId: string;
  title: string;
  reservations: number;
  requests: number;
  availableCopies: number;
  score: number;
}

export function computeDemandAlerts(
  items: {
    bookId: string;
    title: string;
    reservations: number;
    requests: number;
    availableCopies: number;
  }[],
  threshold = 3
): DemandAlert[] {
  return items
    .map((item) => ({
      ...item,
      score: item.reservations * 2 + item.requests,
    }))
    .filter((item) => item.score >= threshold && item.availableCopies <= 1)
    .sort((a, b) => b.score - a.score);
}

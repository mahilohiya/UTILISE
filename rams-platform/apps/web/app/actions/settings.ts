"use server";

import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

/**
 * Returns the active fine rule, creating a sensible default one if none
 * exists yet (fresh databases have no FineRule row until an admin sets one).
 */
export async function getOrCreateFineRule() {
  const existing = await prisma.fineRule.findFirst();
  if (existing) return existing;

  return prisma.fineRule.create({
    data: { perDayAmount: 5, gracePeriodDays: 2, maxFineCap: 500 },
  });
}

export async function updateFineRule(data: {
  id: string;
  perDayAmount: number;
  gracePeriodDays: number;
  maxFineCap: number;
}) {
  const session = await auth();
  if (!can(session?.user, "update", "Fine")) {
    throw new Error("Unauthorized: only admins can update fine settings.");
  }

  if (data.perDayAmount < 0 || data.gracePeriodDays < 0 || data.maxFineCap < 0) {
    throw new Error("Values cannot be negative.");
  }
  if (data.maxFineCap < data.perDayAmount) {
    throw new Error("Max fine cap can't be less than the per-day rate.");
  }

  const updated = await prisma.fineRule.update({
    where: { id: data.id },
    data: {
      perDayAmount: data.perDayAmount,
      gracePeriodDays: data.gracePeriodDays,
      maxFineCap: data.maxFineCap,
    },
  });

  logger.info(
    { adminId: session!.user.id, fineRuleId: updated.id },
    "fine rule settings updated"
  );

  revalidatePath("/dashboard/admin/settings");
  return updated;
}

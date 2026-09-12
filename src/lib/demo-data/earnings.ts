import type { EarningsEntry, MonthlyEarnings, PayoutMethod } from "@/types/domain";

export const earningsByCreator: Record<string, EarningsEntry[]> = {
  alexis: [
    {
      id: "earn-1",
      creatorProfileId: "creator-alexis",
      collaborationId: "collab-5",
      amount: 360,
      type: "collaboration_payout",
      status: "withdrawn",
      createdAt: "2026-08-02T00:00:00.000Z",
    },
    {
      id: "earn-2",
      creatorProfileId: "creator-alexis",
      collaborationId: "collab-1",
      amount: 465,
      type: "collaboration_payout",
      status: "in_transit",
      createdAt: "2026-09-10T00:00:00.000Z",
    },
    {
      id: "earn-3",
      creatorProfileId: "creator-alexis",
      collaborationId: null,
      amount: 90,
      type: "affiliate_reward",
      status: "available",
      createdAt: "2026-09-01T00:00:00.000Z",
    },
  ],
  marcus: [],
  juliette: [],
};

export const monthlyEarningsByCreator: Record<string, MonthlyEarnings[]> = {
  alexis: [
    { month: "Apr", amount: 280 },
    { month: "May", amount: 410 },
    { month: "Jun", amount: 360 },
    { month: "Jul", amount: 520 },
    { month: "Aug", amount: 360 },
    { month: "Sep", amount: 465 },
  ],
  marcus: [
    { month: "Apr", amount: 0 },
    { month: "May", amount: 0 },
    { month: "Jun", amount: 0 },
    { month: "Jul", amount: 0 },
    { month: "Aug", amount: 0 },
    { month: "Sep", amount: 0 },
  ],
  juliette: [
    { month: "Apr", amount: 0 },
    { month: "May", amount: 0 },
    { month: "Jun", amount: 0 },
    { month: "Jul", amount: 0 },
    { month: "Aug", amount: 0 },
    { month: "Sep", amount: 0 },
  ],
};

export const payoutMethodsByCreator: Record<string, PayoutMethod[]> = {
  alexis: [
    {
      id: "payout-1",
      creatorProfileId: "creator-alexis",
      methodType: "bank_transfer",
      bankAccountHolder: "Alexis Jarre",
      bankLastFour: "4821",
      isActive: true,
    },
    {
      id: "payout-2",
      creatorProfileId: "creator-alexis",
      methodType: "stripe_connect",
      bankAccountHolder: null,
      bankLastFour: null,
      isActive: false,
    },
  ],
  marcus: [
    {
      id: "payout-3",
      creatorProfileId: "creator-marcus",
      methodType: "bank_transfer",
      bankAccountHolder: null,
      bankLastFour: null,
      isActive: false,
    },
  ],
  juliette: [
    {
      id: "payout-4",
      creatorProfileId: "creator-juliette",
      methodType: "bank_transfer",
      bankAccountHolder: null,
      bankLastFour: null,
      isActive: false,
    },
  ],
};

export function totals(handle: string) {
  const entries = earningsByCreator[handle] ?? [];
  const sum = (status: EarningsEntry["status"]) =>
    entries.filter((e) => e.status === status).reduce((acc, e) => acc + e.amount, 0);
  const totalEarned = entries.reduce((acc, e) => acc + e.amount, 0);
  return {
    totalEarned,
    inTransit: sum("in_transit"),
    available: sum("available"),
    paidCollaborations: entries.filter((e) => e.type === "collaboration_payout").length,
  };
}

import type { AffiliateReferral } from "@/types/domain";

export const affiliateReferralsByCreator: Record<string, AffiliateReferral[]> = {
  alexis: [
    {
      id: "ref-1",
      referrerProfileId: "creator-alexis",
      referralType: "invite_brand",
      referralCode: "alexis-jarre",
      sharePercent: 25,
      rewardWindowMonths: 3,
      status: "activated",
    },
    {
      id: "ref-2",
      referrerProfileId: "creator-alexis",
      referralType: "invite_creator",
      referralCode: "alexis-jarre",
      sharePercent: 25,
      rewardWindowMonths: 3,
      status: "pending",
    },
  ],
  marcus: [
    {
      id: "ref-3",
      referrerProfileId: "creator-marcus",
      referralType: "invite_brand",
      referralCode: "marcus-oduya",
      sharePercent: 25,
      rewardWindowMonths: 3,
      status: "pending",
    },
    {
      id: "ref-4",
      referrerProfileId: "creator-marcus",
      referralType: "invite_creator",
      referralCode: "marcus-oduya",
      sharePercent: 25,
      rewardWindowMonths: 3,
      status: "pending",
    },
  ],
  juliette: [
    {
      id: "ref-5",
      referrerProfileId: "creator-juliette",
      referralType: "invite_brand",
      referralCode: "juliette-caron",
      sharePercent: 25,
      rewardWindowMonths: 3,
      status: "pending",
    },
    {
      id: "ref-6",
      referrerProfileId: "creator-juliette",
      referralType: "invite_creator",
      referralCode: "juliette-caron",
      sharePercent: 25,
      rewardWindowMonths: 3,
      status: "pending",
    },
  ],
};

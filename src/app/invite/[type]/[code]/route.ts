import { NextResponse } from "next/server";
import { REFERRAL_CODE_COOKIE } from "@/lib/constants";

// A creator's affiliate link (naano.com/invite/brand/CODE or
// .../invite/creator/CODE) just needs to remember the code across the
// sign-up + onboarding flow, since the referral_type/role match and the
// actual redemption both happen server-side once the account exists — see
// completeOnboardingAction in src/lib/actions/auth.ts.
export async function GET(request: Request, { params }: { params: Promise<{ type: string; code: string }> }) {
  const { code } = await params;
  const response = NextResponse.redirect(new URL("/sign-up", request.url));
  response.cookies.set(REFERRAL_CODE_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}

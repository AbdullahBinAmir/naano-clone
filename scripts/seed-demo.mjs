// Seeds the live Supabase project with a rich, realistic demo dataset,
// driven entirely through the same public API surface the real app uses
// (auth.signUp + owner-scoped table writes + the SECURITY DEFINER RPCs) —
// no service_role key is used or required. Safe to re-run: every step
// checks for existing data first.
//
// Usage: node scripts/seed-demo.mjs
//
// All seeded accounts use the password below.

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    }),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const PASSWORD = "12345678";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function client() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
}

async function signUpOrSignIn(email) {
  const c = client();
  const { data, error } = await c.auth.signUp({ email, password: PASSWORD });
  if (error) {
    if (!/already registered|already been registered/i.test(error.message)) throw error;
    const signIn = await c.auth.signInWithPassword({ email, password: PASSWORD });
    if (signIn.error) throw signIn.error;
    return { client: c, userId: signIn.data.user.id, isNew: false };
  }
  return { client: c, userId: data.user.id, isNew: true };
}

const CREATORS = [
  {
    key: "alexis",
    email: "alexis@naano.demo",
    handle: "alexis-jarre",
    displayName: "Alexis Jarre",
    headline: "I write about GTM for B2B SaaS founders",
    bio: "Ex-growth lead turned full-time creator. I break down go-to-market plays for 40,000+ SaaS operators on LinkedIn — pricing, positioning, and the campaigns that actually move pipeline.",
    location: "Paris, France",
    categoryTags: ["B2B", "SaaS", "Growth"],
    followerCount: 42300,
    pricePerPost: 620,
    publish: true,
    linkedinPublicUrl: "https://www.linkedin.com/in/alexis-jarre-demo",
  },
  {
    key: "marcus",
    email: "marcus@naano.demo",
    handle: "marcus-oduya",
    displayName: "Marcus Oduya",
    headline: "Voice of RevOps for mid-market teams",
    bio: "I've run RevOps at three Series B startups. Now I write about the systems that actually keep a pipeline honest — CRM hygiene, forecasting, and the tools worth paying for.",
    location: "London, UK",
    categoryTags: ["RevOps", "B2B", "AI"],
    followerCount: 8100,
    pricePerPost: 280,
    publish: true,
    linkedinPublicUrl: "https://www.linkedin.com/in/marcus-oduya-demo",
  },
  {
    key: "juliette",
    email: "juliette@naano.demo",
    handle: "juliette-caron",
    displayName: "Juliette Caron",
    headline: "Design engineer sharing what I learn in public",
    bio: "Building in public as a design engineer. New here — still finding my voice and my audience.",
    location: "Lyon, France",
    categoryTags: ["Design", "B2C", "AI"],
    followerCount: 340,
    pricePerPost: 120,
    publish: false,
    linkedinPublicUrl: "https://www.linkedin.com/in/juliette-caron-demo",
  },
];

const BRANDS = [
  { key: "ferngrove", email: "ferngrove@naano.demo", companyName: "Ferngrove", industry: "Sales engagement software", planTier: "self_serve" },
  { key: "bramble", email: "bramble@naano.demo", companyName: "Bramble", industry: "Design tooling for revenue teams", planTier: "managed" },
  { key: "northloop", email: "northloop@naano.demo", companyName: "Northloop", industry: "Pipeline forecasting", planTier: "self_serve" },
];

const CAMPAIGNS = [
  {
    key: "ferngrove-outbound",
    brandKey: "ferngrove",
    title: "Outbound playbook launch",
    briefText: "Share how your audience thinks about outbound in 2026 and where Ferngrove fits into a modern sequence. Native voice, no script.",
    budget: 3200,
    targetVertical: "B2B SaaS, RevOps, Sales",
    status: "published",
  },
  {
    key: "bramble-design-week",
    brandKey: "bramble",
    title: "Design Week spotlight",
    briefText: "A first-look post covering Bramble's new collaborative canvas, framed around a real workflow problem you've hit.",
    budget: 1800,
    targetVertical: "Design, B2B",
    status: "published",
  },
  {
    key: "northloop-forecast",
    brandKey: "northloop",
    title: "Forecasting accuracy series",
    briefText: "Three-post arc on why most forecasts are wrong and what a tighter process looks like.",
    budget: 4600,
    targetVertical: "RevOps, Sales leadership",
    status: "draft",
  },
];

const people = {}; // key -> { client, userId, role, ...data }

async function ensureAccount(kind, data) {
  console.log(`\n--- ${kind} ${data.key} (${data.email}) ---`);
  const { client: c, userId, isNew } = await signUpOrSignIn(data.email);
  people[data.key] = { client: c, userId, ...data };

  const { data: existingProfile } = await c.from("profiles").select("id, role").eq("id", userId).maybeSingle();
  if (existingProfile) {
    console.log("  profile already onboarded, skipping onboarding insert");
    return;
  }

  const { error: profileError } = await c.from("profiles").insert({ id: userId, role: kind, email: data.email });
  if (profileError) throw new Error(`${data.key} profile insert: ${profileError.message}`);

  if (kind === "creator") {
    const { error: cpError } = await c.from("creator_profiles").insert({
      profile_id: userId,
      handle: data.handle,
      display_name: data.displayName,
      headline: data.headline,
    });
    if (cpError) throw new Error(`${data.key} creator_profiles insert: ${cpError.message}`);

    const { error: ccError } = await c.from("creator_cards").insert({ creator_profile_id: userId, card_slug: data.handle });
    if (ccError) throw new Error(`${data.key} creator_cards insert: ${ccError.message}`);
  } else {
    const { error: bpError } = await c.from("brand_profiles").insert({ profile_id: userId, company_name: data.companyName });
    if (bpError) throw new Error(`${data.key} brand_profiles insert: ${bpError.message}`);
  }
  console.log(`  onboarded as ${kind} (new account: ${isNew})`);
}

async function fillCreatorProfile(key) {
  const p = people[key];
  const { error } = await p.client
    .from("creator_profiles")
    .update({
      display_name: p.displayName,
      headline: p.headline,
      bio: p.bio,
      location: p.location,
      category_tags: p.categoryTags,
      follower_count: p.followerCount,
      linkedin_public_url: p.linkedinPublicUrl,
    })
    .eq("profile_id", p.userId);
  if (error) throw new Error(`${key} creator_profiles update: ${error.message}`);

  const { error: cardError } = await p.client
    .from("creator_cards")
    .update({
      price_per_post: p.pricePerPost,
      published_at: p.publish ? new Date().toISOString() : null,
      sample_post_urls: [
        `https://www.linkedin.com/posts/${p.handle}_post-1`,
        `https://www.linkedin.com/posts/${p.handle}_post-2`,
      ],
    })
    .eq("creator_profile_id", p.userId);
  if (cardError) throw new Error(`${key} creator_cards update: ${cardError.message}`);
  console.log(`  filled profile + card for ${key} (followers=${p.followerCount}, published=${p.publish})`);
}

async function fillBrandProfile(key) {
  const p = people[key];
  const { error } = await p.client
    .from("brand_profiles")
    .update({ industry: p.industry, plan_tier: p.planTier })
    .eq("profile_id", p.userId);
  if (error) throw new Error(`${key} brand_profiles update: ${error.message}`);
  console.log(`  filled brand profile for ${key}`);
}

const campaignIds = {};

async function ensureCampaign(c) {
  const brand = people[c.brandKey];
  const { data: existing } = await brand.client
    .from("campaigns")
    .select("id")
    .eq("brand_profile_id", brand.userId)
    .eq("title", c.title)
    .maybeSingle();
  if (existing) {
    campaignIds[c.key] = existing.id;
    console.log(`  campaign "${c.title}" already exists`);
    return;
  }
  const { data: inserted, error } = await brand.client
    .from("campaigns")
    .insert({
      brand_profile_id: brand.userId,
      title: c.title,
      brief_text: c.briefText,
      budget: c.budget,
      target_vertical: c.targetVertical,
      status: c.status,
    })
    .select("id")
    .single();
  if (error) throw new Error(`campaign ${c.key}: ${error.message}`);
  campaignIds[c.key] = inserted.id;
  console.log(`  created campaign "${c.title}" for ${c.brandKey}`);
}

async function findCollaboration(creatorKey, brandKey, campaignId, campaignTitle) {
  const creator = people[creatorKey];
  const brand = people[brandKey];
  let query = creator.client
    .from("collaborations")
    .select("id, status")
    .eq("creator_profile_id", creator.userId)
    .eq("brand_profile_id", brand.userId);
  query = campaignId ? query.eq("campaign_id", campaignId) : query.eq("campaign_title", campaignTitle);
  const { data } = await query.maybeSingle();
  return data;
}

async function seedConversation(creatorKey, brandKey, collaborationId) {
  const creator = people[creatorKey];
  const brand = people[brandKey];
  const { error } = await creator.client.rpc("create_collaboration_conversation", {
    p_collaboration_id: collaborationId,
    p_creator_profile_id: creator.userId,
    p_brand_profile_id: brand.userId,
  });
  if (error) console.log(`    (conversation seed skipped: ${error.message})`);
  const { error: welcomeError } = await creator.client.rpc("ensure_naanobot_welcome", { p_creator_profile_id: creator.userId });
  if (welcomeError) console.log(`    (naanobot welcome skipped: ${welcomeError.message})`);
}

// action: "apply" (creator-initiated, needs a published campaign) or
// "invite" (brand-initiated direct outreach, campaign_id null)
async function ensureCollaboration({ creatorKey, brandKey, action, campaignKey, agreedPrice, advanceTo }) {
  const creator = people[creatorKey];
  const brand = people[brandKey];
  const campaignId = campaignKey ? campaignIds[campaignKey] : null;
  const campaign = campaignKey ? CAMPAIGNS.find((c) => c.key === campaignKey) : null;
  const price = campaign ? campaign.budget : agreedPrice;
  const campaignTitle = campaign ? campaign.title : "Direct outreach";

  let collab = await findCollaboration(creatorKey, brandKey, campaignId, campaignTitle);
  if (!collab) {
    const actor = action === "apply" ? creator : brand;
    const status = action === "apply" ? "applied" : "needs_action";
    const { data: inserted, error } = await actor.client
      .from("collaborations")
      .insert({
        campaign_id: campaignId,
        campaign_title: campaignTitle,
        creator_profile_id: creator.userId,
        brand_profile_id: brand.userId,
        brand_name: brand.companyName,
        status,
        agreed_price: price,
        net_payout_to_creator: price,
        next_action_text: action === "apply" ? "Waiting on brand review" : "Review the offer and confirm the post date",
      })
      .select("id, status")
      .single();
    if (error) throw new Error(`collaboration ${creatorKey}/${brandKey}: ${error.message}`);
    collab = inserted;
    console.log(`  created collaboration ${creatorKey} x ${brandKey} (${campaignTitle}, €${price}, ${status})`);
    await seedConversation(creatorKey, brandKey, collab.id);
  } else {
    console.log(`  collaboration ${creatorKey} x ${brandKey} already exists (status=${collab.status})`);
  }

  const transitions =
    advanceTo === "declined"
      ? [{ action: "decline", by: action === "apply" ? brand : creator }]
      : advanceTo === "active"
        ? [{ action: "accept", by: action === "apply" ? brand : creator }]
        : advanceTo === "completed"
          ? [{ action: "accept", by: action === "apply" ? brand : creator }, { action: "complete", by: creator }]
          : [];

  for (const t of transitions) {
    const { data: fresh } = await t.by.client.from("collaborations").select("status").eq("id", collab.id).single();
    if (fresh.status === advanceTo || fresh.status === "declined" || fresh.status === "completed") continue;
    const { error } = await t.by.client.rpc("update_collaboration_status", {
      p_collaboration_id: collab.id,
      p_action: t.action,
    });
    if (error) {
      console.log(`    transition ${t.action} skipped: ${error.message}`);
      continue;
    }
    console.log(`    -> ${t.action} (by ${t.by === creator ? creatorKey : brandKey})`);
    if (t.action === "complete") {
      const { error: payoutError } = await creator.client.rpc("record_collaboration_payout", { p_collaboration_id: collab.id });
      if (payoutError) console.log(`    payout skipped: ${payoutError.message}`);
      const { error: refError } = await creator.client.rpc("activate_referrals_for_completed_collaboration", {
        p_collaboration_id: collab.id,
      });
      if (refError) console.log(`    referral activation skipped: ${refError.message}`);
    }
  }
  return collab.id;
}

async function seedAnalytics(key, months) {
  const p = people[key];
  const { data: existing } = await p.client.from("linkedin_analytics_snapshots").select("id").eq("creator_profile_id", p.userId).limit(1);
  if (existing && existing.length > 0) {
    console.log(`  analytics already seeded for ${key}`);
    return;
  }
  const now = new Date();
  for (let i = months.length - 1; i >= 0; i--) {
    const capturedAt = new Date(now.getFullYear(), now.getMonth() - i, 15).toISOString();
    const m = months[months.length - 1 - i];
    const { error } = await p.client.from("linkedin_analytics_snapshots").insert({
      creator_profile_id: p.userId,
      captured_at: capturedAt,
      follower_count: m.followers,
      public_post_reach: m.reach,
      public_posts_count: m.posts,
      public_engagements: m.engagements,
      pct_posts_with_reach_data: m.pct,
      source: "manual_entry",
      raw_payload: {},
    });
    if (error) throw new Error(`analytics ${key}: ${error.message}`);
  }
  const { error: postsError } = await p.client.from("linkedin_posts").insert([
    {
      creator_profile_id: p.userId,
      original_post_url: `https://www.linkedin.com/posts/${p.handle}_flagship-post`,
      posted_at: new Date(now.getFullYear(), now.getMonth(), 3).toISOString(),
      reach: months[months.length - 1].reach,
      engagements: months[months.length - 1].engagements,
      has_reach_data: true,
    },
    {
      creator_profile_id: p.userId,
      original_post_url: `https://www.linkedin.com/posts/${p.handle}_earlier-post`,
      posted_at: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString(),
      reach: null,
      engagements: Math.round(months[months.length - 1].engagements * 0.6),
      has_reach_data: false,
    },
  ]);
  if (postsError) throw new Error(`posts ${key}: ${postsError.message}`);
  console.log(`  seeded ${months.length} analytics snapshots + 2 posts for ${key}`);
}

async function seedMessages(creatorKey, brandKey, collaborationId, lines) {
  const creator = people[creatorKey];
  const brand = people[brandKey];
  const { data: convo } = await creator.client
    .from("conversations")
    .select("id")
    .eq("collaboration_id", collaborationId)
    .maybeSingle();
  if (!convo) {
    console.log(`  no conversation found for ${creatorKey}/${brandKey}, skipping messages`);
    return;
  }
  const { data: existingMsgs } = await creator.client.from("messages").select("id").eq("conversation_id", convo.id).limit(1);
  if (existingMsgs && existingMsgs.length > 0) {
    console.log(`  messages already seeded for ${creatorKey}/${brandKey}`);
    return;
  }
  for (const line of lines) {
    const actor = line.from === "creator" ? creator : brand;
    const { error } = await actor.client.from("messages").insert({
      conversation_id: convo.id,
      sender_profile_id: actor.userId,
      body: line.text,
      is_system: false,
    });
    if (error) console.log(`    message skipped: ${error.message}`);
    await sleep(150);
  }
  console.log(`  seeded ${lines.length} messages for ${creatorKey}/${brandKey}`);
}

async function seedPayoutMethod(key, holder, lastFour) {
  const p = people[key];
  const { data: existing } = await p.client
    .from("payout_methods")
    .select("id")
    .eq("creator_profile_id", p.userId)
    .eq("method_type", "bank_transfer")
    .maybeSingle();
  if (existing) {
    console.log(`  payout method already set for ${key}`);
    return;
  }
  const { error } = await p.client.from("payout_methods").insert({
    creator_profile_id: p.userId,
    method_type: "bank_transfer",
    bank_account_holder: holder,
    bank_last_four: lastFour,
    is_active: true,
  });
  if (error) throw new Error(`payout method ${key}: ${error.message}`);
  console.log(`  set bank payout method for ${key}`);
}

async function seedReferralLink(key, referralType) {
  const p = people[key];
  const { data: existing } = await p.client
    .from("affiliate_referrals")
    .select("id, referral_code")
    .eq("referrer_profile_id", p.userId)
    .eq("referral_type", referralType)
    .maybeSingle();
  if (existing) return existing.referral_code;
  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  const { error } = await p.client
    .from("affiliate_referrals")
    .insert({ referrer_profile_id: p.userId, referral_type: referralType, referral_code: code });
  if (error) throw new Error(`referral link ${key}: ${error.message}`);
  console.log(`  generated ${referralType} referral code for ${key}: ${code}`);
  return code;
}

async function redeemReferral(key, code) {
  const p = people[key];
  const { error } = await p.client.rpc("redeem_referral_code", { p_code: code });
  if (error) console.log(`  redeem skipped for ${key}: ${error.message}`);
  else console.log(`  ${key} redeemed referral code ${code}`);
}

async function main() {
  console.log("=== Creating / signing in accounts ===");
  for (const c of CREATORS) await ensureAccount("creator", c);
  for (const b of BRANDS) await ensureAccount("brand", b);

  console.log("\n=== Filling profiles ===");
  for (const c of CREATORS) await fillCreatorProfile(c.key);
  for (const b of BRANDS) await fillBrandProfile(b.key);

  console.log("\n=== Affiliate: Alexis's invite_creator link, redeemed by Juliette ===");
  const alexisCreatorCode = await seedReferralLink("alexis", "invite_creator");
  await seedReferralLink("alexis", "invite_brand");
  await redeemReferral("juliette", alexisCreatorCode);
  await seedReferralLink("marcus", "invite_creator");
  await seedReferralLink("marcus", "invite_brand");

  console.log("\n=== Campaigns ===");
  for (const c of CAMPAIGNS) await ensureCampaign(c);

  console.log("\n=== Collaborations ===");
  const alexisCompletedId = await ensureCollaboration({
    creatorKey: "alexis",
    brandKey: "ferngrove",
    action: "apply",
    campaignKey: "ferngrove-outbound",
    advanceTo: "completed",
  });
  await ensureCollaboration({
    creatorKey: "marcus",
    brandKey: "ferngrove",
    action: "apply",
    campaignKey: "ferngrove-outbound",
    advanceTo: "applied",
  });
  await ensureCollaboration({
    creatorKey: "alexis",
    brandKey: "ferngrove",
    action: "invite",
    agreedPrice: 900,
    advanceTo: "active",
  });
  await ensureCollaboration({
    creatorKey: "juliette",
    brandKey: "bramble",
    action: "apply",
    campaignKey: "bramble-design-week",
    advanceTo: "completed",
  });
  await ensureCollaboration({
    creatorKey: "marcus",
    brandKey: "northloop",
    action: "invite",
    agreedPrice: 650,
    advanceTo: "declined",
  });
  await ensureCollaboration({
    creatorKey: "marcus",
    brandKey: "bramble",
    action: "invite",
    agreedPrice: 500,
    advanceTo: "needs_action",
  });
  const alexisSecondCompletedId = await ensureCollaboration({
    creatorKey: "alexis",
    brandKey: "bramble",
    action: "invite",
    agreedPrice: 750,
    advanceTo: "completed",
  });

  console.log("\n=== Messages ===");
  await seedMessages("alexis", "ferngrove", alexisCompletedId, [
    { from: "brand", text: "Loved the draft outline — can you lean harder into the pipeline-impact angle?" },
    { from: "creator", text: "Yep, reworking the hook now. Will have a new draft to you today." },
    { from: "brand", text: "Perfect, this is live on my end whenever you're ready to post." },
  ]);

  console.log("\n=== Analytics ===");
  await seedAnalytics("alexis", [
    { followers: 39800, reach: 210000, posts: 8, engagements: 6400, pct: 90 },
    { followers: 40600, reach: 245000, posts: 9, engagements: 7100, pct: 92 },
    { followers: 41400, reach: 268000, posts: 7, engagements: 6800, pct: 88 },
    { followers: 42300, reach: 301000, posts: 10, engagements: 8200, pct: 95 },
  ]);
  await seedAnalytics("marcus", [
    { followers: 7200, reach: 48000, posts: 5, engagements: 1900, pct: 80 },
    { followers: 7600, reach: 52000, posts: 6, engagements: 2100, pct: 83 },
    { followers: 7900, reach: 55000, posts: 4, engagements: 1800, pct: 75 },
    { followers: 8100, reach: 61000, posts: 6, engagements: 2400, pct: 85 },
  ]);
  await seedAnalytics("juliette", [{ followers: 340, reach: 1200, posts: 2, engagements: 90, pct: 50 }]);

  console.log("\n=== Payout methods ===");
  await seedPayoutMethod("alexis", "Alexis Jarre", "4821");
  await seedPayoutMethod("marcus", "Marcus Oduya", "7790");

  console.log("\n=== Settling + withdrawing Alexis's earnings ===");
  console.log("  waiting for the simulated settlement window...");
  await sleep(65_000);
  const { error: settleError } = await people.alexis.client.rpc("settle_pending_earnings");
  if (settleError) console.log(`  settle skipped: ${settleError.message}`);
  const { error: withdrawError } = await people.alexis.client.rpc("request_withdrawal", { p_amount: 1500 });
  if (withdrawError) console.log(`  withdrawal skipped: ${withdrawError.message}`);
  else console.log("  withdrew €1500 for alexis");

  console.log("\n=== Done ===");
  console.log(`All accounts use password: ${PASSWORD}`);
  console.log("Creators:", CREATORS.map((c) => c.email).join(", "));
  console.log("Brands:  ", BRANDS.map((b) => b.email).join(", "));
  console.log(`(alexisCompletedId=${alexisCompletedId}, alexisSecondCompletedId=${alexisSecondCompletedId})`);
}

main().catch((err) => {
  console.error("\nSEED FAILED:", err);
  process.exit(1);
});

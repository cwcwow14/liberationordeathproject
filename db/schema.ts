import { pgTable, serial, text, timestamp, integer, boolean, unique } from "drizzle-orm/pg-core";

export const threads = pgTable("threads", {
  id: serial().primaryKey(),
  title: text().notNull(),
  body: text().notNull(),
  category: text().notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  pinned: boolean().default(false),
  hot: boolean().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const replies = pgTable("replies", {
  id: serial().primaryKey(),
  threadId: integer("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  body: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const threadReactions = pgTable("thread_reactions", {
  id: serial().primaryKey(),
  threadId: integer("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  emoji: text().notNull(),
}, (t) => [unique("uniq_thread_reaction").on(t.threadId, t.userId, t.emoji)]);

export const replyReactions = pgTable("reply_reactions", {
  id: serial().primaryKey(),
  replyId: integer("reply_id").notNull().references(() => replies.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  emoji: text().notNull(),
}, (t) => [unique("uniq_reply_reaction").on(t.replyId, t.userId, t.emoji)]);

// One row per site user with a Lemon Squeezy subscription. Written only by the
// Lemon Squeezy webhook (src/routes/api/lemonsqueezy-webhook.ts) — the site never
// grants access on its own.
export const memberships = pgTable("memberships", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull().unique(),
  email: text(),
  name: text(),
  tier: text().notNull(),
  status: text().notNull(),
  lsSubscriptionId: text("ls_subscription_id").notNull(),
  lsCustomerId: text("ls_customer_id"),
  variantId: text("variant_id"),
  renewsAt: timestamp("renews_at"),
  endsAt: timestamp("ends_at"),
  lsUpdatedAt: timestamp("ls_updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Members-only content: Dispatch newsletter issues, exclusive posts and videos.
// `minTier` is who can read it; before `earlyUntil`, only Inner Circle can.
export const memberPosts = pgTable("member_posts", {
  id: serial().primaryKey(),
  kind: text().notNull(),
  title: text().notNull(),
  body: text().notNull(),
  videoUrl: text("video_url"),
  minTier: text("min_tier").notNull(),
  earlyUntil: timestamp("early_until"),
  authorName: text("author_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

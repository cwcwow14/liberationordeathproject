import { pgTable, serial, text, timestamp, integer, boolean, unique, index } from "drizzle-orm/pg-core";

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


// "Put yourself on the map" — one row per supporter who pinned a city on /reach.
// `placeKey` is "City|Country" from src/lib/places.ts. `ipHash` is a salted hash
// used only to stop repeat submissions; the IP itself is never stored.
export const mapPins = pgTable("map_pins", {
  id: serial().primaryKey(),
  placeKey: text("place_key").notNull(),
  ipHash: text("ip_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("map_pins_ip_hash_idx").on(t.ipHash)]);

// First-party, cookie-free visitor stats: page views plus a few events
// (Patreon clicks, shares, signups, map pins). No IPs or personal data.
export const analyticsEvents = pgTable("analytics_events", {
  id: serial().primaryKey(),
  kind: text().notNull(),
  path: text().notNull(),
  detail: text(),
  referrer: text(),
  mobile: boolean().default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("analytics_events_created_at_idx").on(t.createdAt)]);

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


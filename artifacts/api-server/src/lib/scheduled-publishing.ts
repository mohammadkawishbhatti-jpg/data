import { db } from "@workspace/db";
import { blogPostsTable, pagesTable } from "@workspace/db";
import { and, eq, isNotNull, lte } from "drizzle-orm";

export async function publishScheduledContent(): Promise<void> {
  const now = new Date();
  await db.update(blogPostsTable)
    .set({ status: "published", scheduledAt: null, updatedAt: now })
    .where(and(eq(blogPostsTable.status, "scheduled"), isNotNull(blogPostsTable.scheduledAt), lte(blogPostsTable.scheduledAt, now)));
  await db.update(pagesTable)
    .set({ isPublished: true, scheduledAt: null, updatedAt: now })
    .where(and(eq(pagesTable.isPublished, false), isNotNull(pagesTable.scheduledAt), lte(pagesTable.scheduledAt, now)));
}
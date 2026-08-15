import { boolean, integer, json, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  parentId: string | null;
  group: string | null;
  order: number;
  isVisible: boolean;
  openInNewTab: boolean;
};

export const menusTable = pgTable("menus", {
  id: serial("id").primaryKey(),
  location: text("location").notNull().unique(),
  name: text("name").notNull(),
  items: json("items").$type<MenuItem[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Menu = typeof menusTable.$inferSelect;
export type InsertMenu = typeof menusTable.$inferInsert;
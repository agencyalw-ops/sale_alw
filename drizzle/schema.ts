import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow with role-based access control.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Customers table for managing customer profiles and contact details.
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zipCode", { length: 20 }),
  country: varchar("country", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Products/Items catalog for managing inventory.
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  stock: int("stock").default(0).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  category: varchar("category", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Sales/Orders table with status tracking.
 * Status can be: pending, completed, cancelled
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0").notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Sales line items - individual products in each sale.
 */
export const saleItems = mysqlTable("saleItems", {
  id: int("id").autoincrement().primaryKey(),
  saleId: int("saleId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = typeof saleItems.$inferInsert;

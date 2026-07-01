import { eq, desc, and, like, gte, lte, between } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, customers, products, sales, saleItems, Customer, Product, Sale, SaleItem, whatsappContacts, whatsappTemplates, whatsappSessions, whatsappCampaigns, WhatsappContact, WhatsappTemplate, WhatsappSession, WhatsappCampaign } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CUSTOMER QUERIES ============

export async function createCustomer(data: Omit<typeof customers.$inferInsert, 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(customers).values(data);
  return result;
}

export async function getCustomers(limit: number = 100, offset: number = 0, search?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = db.select().from(customers);
  
  if (search) {
    query = query.where(
      like(customers.name, `%${search}%`)
    ) as any;
  }
  
  const result = await (query as any)
    .orderBy(desc(customers.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCustomer(id: number, data: Partial<typeof customers.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(customers).set(data).where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(customers).where(eq(customers.id, id));
}

// ============ PRODUCT QUERIES ============

export async function createProduct(data: Omit<typeof products.$inferInsert, 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values(data);
  return result;
}

export async function getProducts(limit: number = 100, offset: number = 0, search?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = db.select().from(products);
  
  if (search) {
    query = query.where(
      like(products.name, `%${search}%`)
    ) as any;
  }
  
  const result = await (query as any)
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(products).where(eq(products.id, id));
}

// ============ SALES QUERIES ============

export async function createSale(data: Omit<typeof sales.$inferInsert, 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(sales).values(data);
  return result;
}

export async function getSales(limit: number = 100, offset: number = 0, status?: string, customerId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let conditions: any[] = [];
  
  if (status) {
    conditions.push(eq(sales.status, status as any));
  }
  
  if (customerId) {
    conditions.push(eq(sales.customerId, customerId));
  }
  
  let query = db.select().from(sales);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const result = await (query as any)
    .orderBy(desc(sales.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getSaleById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSale(id: number, data: Partial<typeof sales.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sales).set(data).where(eq(sales.id, id));
}

export async function deleteSale(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(sales).where(eq(sales.id, id));
}

// ============ SALE ITEMS QUERIES ============

export async function createSaleItem(data: Omit<typeof saleItems.$inferInsert, 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(saleItems).values(data);
  return result;
}

export async function getSaleItems(saleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
  return result;
}

export async function deleteSaleItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(saleItems).where(eq(saleItems.id, id));
}

// ============ DASHBOARD QUERIES ============

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get total revenue from completed sales
  const revenueResult = await db.select().from(sales).where(eq(sales.status, 'completed'));
  const totalRevenue = revenueResult.reduce((sum, sale) => {
    const total = typeof sale.total === 'string' ? parseFloat(sale.total) : sale.total;
    return sum + total;
  }, 0);
  
  // Get total orders
  const totalOrders = revenueResult.length;
  
  // Get recent sales
  const recentSales = await db.select().from(sales)
    .orderBy(desc(sales.createdAt))
    .limit(10);
  
  return {
    totalRevenue,
    totalOrders,
    recentSales,
  };
}

export async function getTopProducts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get all sale items with product info
  const allItems = await db.select().from(saleItems);
  
  // Group by product and sum quantities
  const productMap = new Map<number, { quantity: number; productId: number }>();
  
  for (const item of allItems) {
    const existing = productMap.get(item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      productMap.set(item.productId, { quantity: item.quantity, productId: item.productId });
    }
  }
  
  // Sort by quantity and get top 5
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  // Fetch product details
  const productDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await getProductById(item.productId);
      return {
        ...product,
        totalQuantitySold: item.quantity,
      };
    })
  );
  
  return productDetails;
}

// ============ WHATSAPP CONTACTS QUERIES ============

export async function createWhatsappContact(data: Omit<typeof whatsappContacts.$inferInsert, 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(whatsappContacts).values(data);
  return result;
}

export async function getWhatsappContacts(userId: number, limit: number = 50, offset: number = 0, search?: string, status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let conditions: any[] = [eq(whatsappContacts.userId, userId)];
  
  if (search) {
    conditions.push(like(whatsappContacts.namaInstansi, `%${search}%`));
  }
  
  if (status) {
    conditions.push(eq(whatsappContacts.status, status as any));
  }
  
  let query = db.select().from(whatsappContacts);
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const result = await (query as any)
    .orderBy(desc(whatsappContacts.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getWhatsappContactById(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(whatsappContacts)
    .where(and(eq(whatsappContacts.id, id), eq(whatsappContacts.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateWhatsappContact(id: number, data: Partial<typeof whatsappContacts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(whatsappContacts).set(data).where(eq(whatsappContacts.id, id));
}

export async function deleteWhatsappContact(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(whatsappContacts).where(eq(whatsappContacts.id, id));
}

// ============ WHATSAPP TEMPLATES QUERIES ============

export async function createWhatsappTemplate(data: Omit<typeof whatsappTemplates.$inferInsert, 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(whatsappTemplates).values(data);
  return result;
}

export async function getWhatsappTemplates(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(whatsappTemplates)
    .where(eq(whatsappTemplates.userId, userId))
    .orderBy(desc(whatsappTemplates.createdAt));
  
  return result;
}

export async function getWhatsappTemplateById(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(whatsappTemplates)
    .where(and(eq(whatsappTemplates.id, id), eq(whatsappTemplates.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateWhatsappTemplate(id: number, data: Partial<typeof whatsappTemplates.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(whatsappTemplates).set(data).where(eq(whatsappTemplates.id, id));
}

export async function deleteWhatsappTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(whatsappTemplates).where(eq(whatsappTemplates.id, id));
}

// ============ WHATSAPP SESSIONS QUERIES ============

export async function getWhatsappSession(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(whatsappSessions)
    .where(eq(whatsappSessions.userId, userId))
    .limit(1);
  
  if (result.length > 0) {
    return result[0];
  }
  
  // Create new session if doesn't exist
  const newSession = await db.insert(whatsappSessions).values({
    userId,
    isConnected: false,
  });
  
  return await db.select().from(whatsappSessions)
    .where(eq(whatsappSessions.userId, userId))
    .limit(1)
    .then(r => r[0]);
}

export async function updateWhatsappSession(userId: number, data: Partial<typeof whatsappSessions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(whatsappSessions)
    .where(eq(whatsappSessions.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(whatsappSessions).set(data).where(eq(whatsappSessions.userId, userId));
  } else {
    await db.insert(whatsappSessions).values({ userId, ...data } as any);
  }
  
  return await db.select().from(whatsappSessions)
    .where(eq(whatsappSessions.userId, userId))
    .limit(1)
    .then(r => r[0]);
}

// ============ WHATSAPP CAMPAIGNS QUERIES ============

export async function createWhatsappCampaign(data: Omit<typeof whatsappCampaigns.$inferInsert, 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(whatsappCampaigns).values(data);
  return result;
}

export async function getWhatsappCampaigns(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(whatsappCampaigns)
    .where(eq(whatsappCampaigns.userId, userId))
    .orderBy(desc(whatsappCampaigns.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getWhatsappCampaignById(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(whatsappCampaigns)
    .where(and(eq(whatsappCampaigns.id, id), eq(whatsappCampaigns.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateWhatsappCampaign(id: number, data: Partial<typeof whatsappCampaigns.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(whatsappCampaigns).set(data).where(eq(whatsappCampaigns.id, id));
}

export async function deleteWhatsappCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(whatsappCampaigns).where(eq(whatsappCampaigns.id, id));
}

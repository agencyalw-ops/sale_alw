import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { whatsappRouter } from "./whatsappRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  whatsapp: whatsappRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ CUSTOMER PROCEDURES ============
  customers: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getCustomers(input.limit, input.offset, input.search);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createCustomer(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCustomer(id, data);
        return await db.getCustomerById(id);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomer(input.id);
        return { success: true };
      }),
  }),

  // ============ PRODUCT PROCEDURES ============
  products: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getProducts(input.limit, input.offset, input.search);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/),
        cost: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        stock: z.number().default(0),
        sku: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        return await db.createProduct(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        cost: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        stock: z.number().optional(),
        sku: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return await db.getProductById(id);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ============ SALES PROCEDURES ============
  sales: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        status: z.enum(['pending', 'completed', 'cancelled']).optional(),
        customerId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSales(input.limit, input.offset, input.status, input.customerId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const sale = await db.getSaleById(input.id);
        if (!sale) return null;
        
        const items = await db.getSaleItems(input.id);
        return { ...sale, items };
      }),

    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        orderNumber: z.string(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
        })),
        notes: z.string().optional(),
        tax: z.string().regex(/^\d+(\.\d{1,2})?$/).default('0'),
      }))
      .mutation(async ({ input, ctx }) => {
        // Calculate totals
        let subtotal = 0;
        for (const item of input.items) {
          const price = parseFloat(item.unitPrice);
          subtotal += price * item.quantity;
        }
        
        const tax = parseFloat(input.tax);
        const total = subtotal + tax;
        
        // Create sale
        const saleResult = await db.createSale({
          customerId: input.customerId,
          userId: ctx.user.id,
          orderNumber: input.orderNumber,
          status: 'pending',
          subtotal: subtotal.toString(),
          tax: tax.toString(),
          total: total.toString(),
          notes: input.notes,
        });
        
        // Create sale items
        const saleId = (saleResult as any).insertId;
        for (const item of input.items) {
          const unitPrice = parseFloat(item.unitPrice);
          const itemTotal = unitPrice * item.quantity;
          
          await db.createSaleItem({
            saleId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: unitPrice.toString(),
            total: itemTotal.toString(),
          });
        }
        
        return await db.getSaleById(saleId);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'completed', 'cancelled']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSale(id, data);
        return await db.getSaleById(id);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // Delete sale items first
        const items = await db.getSaleItems(input.id);
        for (const item of items) {
          await db.deleteSaleItem(item.id);
        }
        // Delete sale
        await db.deleteSale(input.id);
        return { success: true };
      }),
  }),

  // ============ DASHBOARD PROCEDURES ============
  dashboard: router({
    stats: protectedProcedure
      .query(async () => {
        return await db.getDashboardStats();
      }),

    topProducts: protectedProcedure
      .query(async () => {
        return await db.getTopProducts();
      }),
  }),

  // ============ ADMIN PROCEDURES ============
  admin: router({
    users: adminProcedure
      .query(async () => {
        // This would list all users - implement as needed
        return [];
      }),

    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['user', 'admin']),
      }))
      .mutation(async ({ input }) => {
        // This would update user role - implement as needed
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

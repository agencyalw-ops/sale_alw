import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const whatsappRouter = router({
  // ============ CONTACTS PROCEDURES ============
  contacts: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        search: z.string().optional(),
        status: z.enum(["pending", "sent", "failed", "skipped"]).optional(),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getWhatsappContacts(ctx.user.id, input.limit, input.offset, input.search, input.status);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getWhatsappContactById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        namaInstansi: z.string().min(1),
        waNumber: z.string().min(1),
        alamat: z.string().optional(),
        kota: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createWhatsappContact({
          userId: ctx.user.id,
          ...input,
          status: "pending",
        });
      }),

    bulkCreate: protectedProcedure
      .input(z.object({
        contacts: z.array(z.object({
          namaInstansi: z.string(),
          waNumber: z.string(),
          alamat: z.string().optional(),
          kota: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const results = [];
        for (const contact of input.contacts) {
          const result = await db.createWhatsappContact({
            userId: ctx.user.id,
            ...contact,
            status: "pending",
          });
          results.push(result);
        }
        return results;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        namaInstansi: z.string().optional(),
        waNumber: z.string().optional(),
        alamat: z.string().optional(),
        kota: z.string().optional(),
        status: z.enum(["pending", "sent", "failed", "skipped"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const contact = await db.getWhatsappContactById(id, ctx.user.id);
        if (!contact) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contact not found" });
        }
        await db.updateWhatsappContact(id, data);
        return await db.getWhatsappContactById(id, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const contact = await db.getWhatsappContactById(input.id, ctx.user.id);
        if (!contact) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contact not found" });
        }
        await db.deleteWhatsappContact(input.id);
        return { success: true };
      }),

    deleteMultiple: protectedProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        for (const id of input.ids) {
          const contact = await db.getWhatsappContactById(id, ctx.user.id);
          if (contact) {
            await db.deleteWhatsappContact(id);
          }
        }
        return { success: true };
      }),
  }),

  // ============ TEMPLATES PROCEDURES ============
  templates: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getWhatsappTemplates(ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getWhatsappTemplateById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        content: z.string().min(1),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createWhatsappTemplate({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        content: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const template = await db.getWhatsappTemplateById(id, ctx.user.id);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }
        await db.updateWhatsappTemplate(id, data);
        return await db.getWhatsappTemplateById(id, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const template = await db.getWhatsappTemplateById(input.id, ctx.user.id);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }
        await db.deleteWhatsappTemplate(input.id);
        return { success: true };
      }),
  }),

  // ============ SESSION PROCEDURES ============
  session: router({
    getStatus: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getWhatsappSession(ctx.user.id);
      }),

    updateQR: protectedProcedure
      .input(z.object({
        qrCode: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.updateWhatsappSession(ctx.user.id, {
          qrCode: input.qrCode,
        });
      }),

    setConnected: protectedProcedure
      .input(z.object({
        isConnected: z.boolean(),
        phoneNumber: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.updateWhatsappSession(ctx.user.id, {
          isConnected: input.isConnected,
          phoneNumber: input.phoneNumber,
          lastActivity: new Date(),
        });
      }),
  }),

  // ============ CAMPAIGNS PROCEDURES ============
  campaigns: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getWhatsappCampaigns(ctx.user.id, input.limit, input.offset);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getWhatsappCampaignById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        templateId: z.number(),
        name: z.string().min(1),
        contactIds: z.array(z.number()),
      }))
      .mutation(async ({ input, ctx }) => {
        const template = await db.getWhatsappTemplateById(input.templateId, ctx.user.id);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }

        return await db.createWhatsappCampaign({
          userId: ctx.user.id,
          templateId: input.templateId,
          name: input.name,
          totalContacts: input.contactIds.length,
          status: "draft",
        });
      }),

    start: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const campaign = await db.getWhatsappCampaignById(input.id, ctx.user.id);
        if (!campaign) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
        }

        await db.updateWhatsappCampaign(input.id, {
          status: "running",
          startedAt: new Date(),
        });

        return await db.getWhatsappCampaignById(input.id, ctx.user.id);
      }),

    pause: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const campaign = await db.getWhatsappCampaignById(input.id, ctx.user.id);
        if (!campaign) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
        }

        await db.updateWhatsappCampaign(input.id, {
          status: "paused",
        });

        return await db.getWhatsappCampaignById(input.id, ctx.user.id);
      }),

    updateStats: protectedProcedure
      .input(z.object({
        id: z.number(),
        sentCount: z.number().optional(),
        failedCount: z.number().optional(),
        skippedCount: z.number().optional(),
        status: z.enum(["draft", "running", "completed", "paused", "cancelled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const campaign = await db.getWhatsappCampaignById(id, ctx.user.id);
        if (!campaign) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
        }

        if (data.status === "completed") {
          data.completedAt = new Date();
        }

        await db.updateWhatsappCampaign(id, data);
        return await db.getWhatsappCampaignById(id, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const campaign = await db.getWhatsappCampaignById(input.id, ctx.user.id);
        if (!campaign) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
        }

        await db.deleteWhatsappCampaign(input.id);
        return { success: true };
      }),
  }),
});

export type WhatsappRouter = typeof whatsappRouter;

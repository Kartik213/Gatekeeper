import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { invalidateFlagCache } from "@/server/services/redis";
import {
  requireFlagAccess,
  requireProjectAccess,
  requireRuleAccess,
} from "@/server/services/authorization";

export const flagsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        enabled: z.boolean().default(false),
        rolloutPercentage: z.number().int().min(0).max(100).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await requireProjectAccess(ctx.db, input.projectId, userId);

      const flag = await ctx.db.featureFlag.create({
        data: input,
      });

      await invalidateFlagCache(flag.projectId, flag.name);

      return flag;
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await requireProjectAccess(ctx.db, input.projectId, userId);

      return ctx.db.featureFlag.findMany({
        where: {
          projectId: input.projectId,
          project: {
            organization: {
              members: {
                some: { userId },
              },
            },
          },
        },
        include: { rules: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const flag = await requireFlagAccess(ctx.db, input.id, userId);

    return ctx.db.featureFlag.findUniqueOrThrow({
      where: { id: flag.id },
      include: { rules: true },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        enabled: z.boolean().optional(),
        rolloutPercentage: z.number().int().min(0).max(100).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...data } = input;
      const existingFlag = await requireFlagAccess(ctx.db, id, userId);

      const flag = await ctx.db.featureFlag.update({
        where: { id: existingFlag.id },
        data,
      });

      await invalidateFlagCache(flag.projectId, flag.name);

      return flag;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const flag = await requireFlagAccess(ctx.db, input.id, userId);

      await ctx.db.featureFlag.delete({ where: { id: flag.id } });
      
      await invalidateFlagCache(flag.projectId, flag.name);

      return { success: true };
    }),

  addRule: protectedProcedure
    .input(
      z.object({
        flagId: z.string(),
        attribute: z.string().min(1),
        operator: z.enum(["equals", "not_equals", "contains", "ends_with", "starts_with", "in"]),
        value: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const flag = await requireFlagAccess(ctx.db, input.flagId, userId);

      const rule = await ctx.db.flagRule.create({ data: input });

      await invalidateFlagCache(flag.projectId, flag.name);

      return rule;
    }),

  removeRule: protectedProcedure
    .input(z.object({ ruleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const rule = await requireRuleAccess(ctx.db, input.ruleId, userId);

      await ctx.db.flagRule.delete({ where: { id: rule.id } });
      
      await invalidateFlagCache(rule.flag.projectId, rule.flag.name);
      
      return { success: true };
    }),
});

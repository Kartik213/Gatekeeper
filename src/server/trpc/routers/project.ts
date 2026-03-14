import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { requireOrganizationAccess, requireProjectAccess } from "@/server/services/authorization";

export const projectsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        organizationSlug: z.string(),
        name: z.string().min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const membership = await requireOrganizationAccess(ctx.db, input.organizationSlug, userId);

      const project = await ctx.db.project.create({
        data: {
          organizationId: membership.organizationId,
          name: input.name,
        },
      });

      return project;
    }),

  list: protectedProcedure
    .input(z.object({ organizationSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const membership = await requireOrganizationAccess(ctx.db, input.organizationSlug, userId);

      return ctx.db.project.findMany({
        where: {
          organizationId: membership.organizationId,
          organization: {
            members: {
              some: { userId },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const project = await requireProjectAccess(ctx.db, input.id, userId);

    return ctx.db.project.findUniqueOrThrow({ where: { id: project.id } });
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const project = await requireProjectAccess(ctx.db, input.id, userId);

      await ctx.db.project.delete({ where: { id: project.id } });

      return { success: true };
    }),
});

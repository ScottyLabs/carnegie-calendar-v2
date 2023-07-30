import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { eventSearchSchema } from "~/utils/schemas";

export const eventRouter = createTRPCRouter({
  search: publicProcedure.input(eventSearchSchema).query(({ input, ctx }) => {
    return ctx.prisma.event.findMany({
      where: {
        AND: [
          {
            OR: [
              { summary: { contains: input.query, mode: "insensitive" } },
              { description: { contains: input.query, mode: "insensitive" } },
              { location: { contains: input.query, mode: "insensitive" } },
              { tags: { hasSome: input.query?.split(" ") ?? [""] } },
            ],
          },
          {
            AND: [
              { start: { gte: input.range?.from } },
              { start: { lte: input.range?.to } },
            ],
          },
        ],
      },
    });
  }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.event.findMany();
  }),
  test: publicProcedure.query(async ({ ctx }) => {
    const { default: info } = await import("~/carnegiecalendar.events.json");
    await ctx.prisma.event.createMany({
      data: info.map((event) => ({
        summary: event.summary,
        description: event.description,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        location: event.location,
        tags: event.tags,
        url: event.url,
      })),
    });
    return "Hello World";
  }),
});

import { prisma } from "~/server/db";

async function update() {
  const { default: info } = await import("~/carnegiecalendar.events.json");
  await prisma.event.createMany({
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
}

update();

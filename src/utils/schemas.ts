import { z } from "zod";

export const eventSearchSchema = z.object({
  query: z.string().optional(),
  range: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
});

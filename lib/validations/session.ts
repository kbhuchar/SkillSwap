import { z } from "zod";

export const sessionSchema = z.object({
  matchId: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().max(1000).optional(),
  scheduledAt: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Session must be scheduled in the future",
  }),
  durationMin: z.number().int().min(15).max(480).default(60),
  meetingLink: z.string().url().optional().or(z.literal("")),
});

export type SessionInput = z.infer<typeof sessionSchema>;

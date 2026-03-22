import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  location: z.string().max(100).optional(),
  image: z.string().url().optional().or(z.literal("")),
  skillsOffered: z
    .array(
      z.object({
        skillId: z.string(),
        name: z.string(),
        level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
      })
    )
    .optional(),
  skillsWanted: z
    .array(
      z.object({
        skillId: z.string(),
        name: z.string(),
        level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
      })
    )
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

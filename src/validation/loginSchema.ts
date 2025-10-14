// Login form validation schema

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(4096),
});

export type LoginType = z.infer<typeof loginSchema>;

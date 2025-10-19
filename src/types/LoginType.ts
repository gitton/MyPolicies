import { loginSchema } from "@/validation/loginSchema";
import { z } from "zod";

export type LoginType = z.infer<typeof loginSchema>;

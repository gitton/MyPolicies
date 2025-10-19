import { policySchema } from "@/validation/policySchema";
import { z } from "zod";

export type PolicyFormData = z.infer<typeof policySchema>;

export type PolicyCategory = "car" | "van" | "motorbike" | "house";

export type PolicyType = z.infer<typeof policySchema>;

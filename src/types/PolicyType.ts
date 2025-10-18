import { fullPolicySchema, policyFormSchema } from "@/validation/policySchema";
import { z } from "zod";

export type PolicyFormData = z.infer<typeof policyFormSchema>;

export type PolicyCategory = "car" | "van" | "motorbike" | "house";

export type PolicyType = z.infer<typeof fullPolicySchema>;

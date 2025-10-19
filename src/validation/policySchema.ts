import { z } from "zod";

export const policySchema = z
  .object({
    provider: z
      .string()
      .min(1, "Provider name is required")
      .max(100, "Provider name is too long"),

    policyNumber: z
      .string()
      .min(1, "Policy number is required")
      .max(50, "Policy number is too long")
      .regex(
        /^[A-Z0-9-]+$/i,
        "Policy number must contain only letters, numbers, and hyphens"
      ),

    premium: z
      .string()
      .min(1, "Premium amount is required")
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "Premium must be a valid amount (e.g., 123.45)"
      ),

    startDate: z.date({
      required_error: "Start date is required",
      invalid_type_error: "Start date must be a valid date",
    }),

    endDate: z.date({
      required_error: "End date is required",
      invalid_type_error: "End date must be a valid date",
    }),

    policyType: z.enum(["car", "van", "motorbike", "house"], {
      required_error: "Policy category is required",
    }),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "Start date must be before end date",
    path: ["endDate"],
  });

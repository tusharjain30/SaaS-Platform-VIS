const { z } = require("zod");

const createTemplateSchema = z.object({
  name: z
    .string({ required_error: "Template name is required" })
    .min(2, "Template name must be at least 2 characters")
    .max(512, "Template name is too long")
    .transform((val) => val.toLowerCase().replace(/\s+/g, "_")), // meta-safe

  category: z.enum(
    ["MARKETING", "UTILITY", "AUTHENTICATION"],
    { required_error: "Template category is required" }
  ),

  language: z
    .string()
    .default("en_US"),

  body: z
    .string({ required_error: "Template body is required" })
    .min(5, "Template body is too short")
    .max(1024, "Template body is too long"),

  variables: z
    .array(z.string())
    .optional()
});

module.exports = createTemplateSchema;

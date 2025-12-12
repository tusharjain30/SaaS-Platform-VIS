const { z } = require("zod");

/* ---------------- MEDIA FILES ---------------- */
const mediaFilesSchema = z.object({
  image: z.string().url().optional(),
  video: z.string().url().optional(),
  document: z.string().url().optional(),

  location: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    })
    .optional()
}).optional();

/* ---------------- HEADER ---------------- */
const headerSchema = z.object({
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "DOCUMENT", "LOCATION"]),
  text: z.string().optional(),
  url: z.string().url().optional()
}).superRefine((data, ctx) => {
  if (data.type === "TEXT" && !data.text) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["text"],
      message: "Header text is required for TEXT header"
    });
  }
});

/* ---------------- BUTTONS ---------------- */
const urlButton = z.object({
  type: z.literal("URL"),
  text: z.string().min(1),
  url: z.string().url()
});

const quickReplyButton = z.object({
  type: z.literal("QUICK_REPLY"),
  text: z.string().min(1)
});

const callButton = z.object({
  type: z.literal("CALL"),
  text: z.string().min(1),
  phoneNumber: z.string().min(10)
});

const buttonsSchema = z
  .array(
    z.discriminatedUnion("type", [urlButton, quickReplyButton, callButton])
  )
  .max(3, "Maximum 3 buttons allowed")
  .optional();

/* ---------------- FOOTER ---------------- */
const footerSchema = z.object({
  text: z.string().min(1, "Footer text cannot be empty")
}).optional();

/* ---------------- TEMPLATE MAIN ---------------- */
const createTemplateSchema = z.object({
  name: z.string().min(3),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
  language: z.string().default("en_US"),
  body: z.string().min(5),

  header: headerSchema.optional(),
  footer: footerSchema,
  buttons: buttonsSchema,
  mediaFiles: mediaFilesSchema
});

module.exports = { createTemplateSchema };

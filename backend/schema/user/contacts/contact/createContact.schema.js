const { z } = require("zod");

const createContactSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),

  phone: z.string({
    required_error: "Phone is required",
    invalid_type_error: "Phone must be a string"
  }).min(10, "Phone must be 10 digits").max(10, "Phone must be 10 digits"),
  languageCode: z.string().optional(),
  email: z.string().email().optional(),

  isOptedOut: z.boolean().optional(),

  groups: z.array(z.number()).optional(), // group IDs

  customFields: z.record(z.string()).optional()
  // example:
  // {
  //   "company": "Vibrantick",
  //   "email2": "x@y.com"
  // }
});

module.exports = { createContactSchema };

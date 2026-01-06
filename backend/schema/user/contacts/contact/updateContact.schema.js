const { z } = require("zod");

const updateContactSchema = z.object({
    contactId: z
        .number({
            required_error: "Contact Id is required",
            invalid_type_error: "Contact Id must be a number",
        }),
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    country: z.string().min(2).optional(),
    languageCode: z.string().optional(),
    email: z.string().email().optional(),

    isOptedOut: z.boolean({
        invalid_type_error: "isOptedOut must be a boolean"
    }).optional(),

    groups: z.array(z.number().int().positive()).optional(),

    customFields: z.record(z.string(), z.any()).optional()
});

module.exports = { updateContactSchema };

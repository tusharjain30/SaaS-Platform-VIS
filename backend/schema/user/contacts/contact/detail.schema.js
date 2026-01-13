const { z } = require("zod");

const detailContactSchema = z.object({
    contactId: z
        .string({
            required_error: "Contact Id is required",
            invalid_type_error: "Contact Id must be a string",
        })
        .regex(/^\d+$/, "Contact Id must be a valid number"),
});

module.exports = { detailContactSchema };

const { z } = require("zod");

const deleteContactSchema = z.object({
    contactId: z
        .number({
            required_error: "Contact Id is required",
            invalid_type_error: "Contact Id must be a number",
        })
});

module.exports = { deleteContactSchema };

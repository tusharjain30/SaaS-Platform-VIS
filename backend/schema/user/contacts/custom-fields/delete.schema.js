const { z } = require("zod");

const deleteCustomFieldSchema = z.object({
    fieldId: z.number({
        required_error: "Field id is required",
        invalid_type_error: "Field id must be a string"
    }).int().positive("Field ID must be a valid number"),
});

module.exports = {
    deleteCustomFieldSchema,
};
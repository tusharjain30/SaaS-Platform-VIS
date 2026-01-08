const { z } = require("zod");

const updateCustomFieldSchema = z.object({
    fieldId: z.number({
        required_error: "Field id is required",
        invalid_type_error: "Field id must be a number"
    }).int().positive(),

    name: z.string({
        required_error: "Name is required"
    }).min(1, "Name is required"),

    type: z.enum(["text", "number", "email", "url", "date", "time", "datetime"]),
});

module.exports = {
    updateCustomFieldSchema
};
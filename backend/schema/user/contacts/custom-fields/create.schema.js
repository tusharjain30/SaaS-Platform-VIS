const { z } = require("zod");

const createCustomFieldSchema = z.object({
    name: z.string({
        required_error: "Name is required"
    }).min(2, "Name is required"),

    type: z.enum([
        "text",
        "number",
        "email",
        "url",
        "date",
        "time",
        "datetime"
    ])
});

module.exports = { createCustomFieldSchema };

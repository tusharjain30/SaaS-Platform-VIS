const { z } = require("zod");

const listCustomFieldsSchema = z.object({
    search: z.string().optional(),
});

module.exports = {
    listCustomFieldsSchema,
};

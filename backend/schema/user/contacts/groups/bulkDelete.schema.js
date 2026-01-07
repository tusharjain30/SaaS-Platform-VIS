const { z } = require("zod");

const bulkDeleteGroupSchema = z.object({
    groupIds: z
        .array(z.number().int().positive())
        .min(1, "At least one group id is required")
});

module.exports = { bulkDeleteGroupSchema };

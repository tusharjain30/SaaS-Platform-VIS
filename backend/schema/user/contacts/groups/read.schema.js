const { z } = require("zod");

const readGroupsBodySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  isArchived: z.boolean().optional(),
  isDeleted: z.boolean().optional().default(false)
});

module.exports = { readGroupsBodySchema };

const { z } = require("zod");

const getGroupContactsSchema = z.object({
  groupId: z.number({
    required_error: "Group Id is required",
    invalid_type_error: "Group Id must be a number"
  }).int().positive(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().optional()
});

module.exports = { getGroupContactsSchema };

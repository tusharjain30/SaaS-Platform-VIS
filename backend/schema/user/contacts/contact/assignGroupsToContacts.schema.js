const { z } = require("zod");

const assignGroupsToContactsSchema = z.object({
  contactIds: z.array(z.number().int().positive()).min(1, "At least 1 contact is required"),
  groupIds: z.array(z.number().int().positive()).min(1, "At least 1 group is required")
});

module.exports = { assignGroupsToContactsSchema };

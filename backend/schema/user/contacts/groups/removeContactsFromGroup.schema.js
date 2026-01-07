const { z } = require("zod");

const removeContactsFromGroupSchema = z.object({
  groupId: z.number().int().positive(),
  contactIds: z.array(z.number().int().positive()).min(1, "At least 1 contact is required")
});

module.exports = { removeContactsFromGroupSchema };

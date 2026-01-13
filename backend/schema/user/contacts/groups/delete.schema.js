const { z } = require("zod");

const deleteGroupSchema = z.object({
      groupId: z
        .string({
            required_error: "Group Id is required",
            invalid_type_error: "Group Id must be a string",
        })
        .regex(/^\d+$/, "Group Id must be a valid number"),
});

module.exports = { deleteGroupSchema };

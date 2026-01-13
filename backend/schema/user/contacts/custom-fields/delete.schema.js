const { z } = require("zod");

const deleteCustomFieldSchema = z.object({
  fieldId: z
    .string({
      required_error: "Field id is required",
      invalid_type_error: "Field id must be a string",
    })
    .regex(/^\d+$/, "Field id must be a valid number"),
});

module.exports = {
  deleteCustomFieldSchema,
};

const { z } = require("zod");

const customFieldDetailSchema = z.object({
  fieldId: z.number({
    required_error: "Field id is required",
    invalid_type_error: "Field id must be a number"
  }).int().positive(),
});

module.exports = {
  customFieldDetailSchema,
};
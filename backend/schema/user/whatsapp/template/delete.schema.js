const { z } = require("zod");

const softDeleteTemplateSchema = z.object({
    templateId: z.number({ required_error: "Template Id is required" })
});

module.exports = { softDeleteTemplateSchema };

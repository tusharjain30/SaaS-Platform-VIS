const { z } = require("zod");

const sendMediaMessageSchema = z.object({
    to: z.string({
        required_error: "To is required"
    }).min(10, "Invalid phone number").max(10, "Invalid phone number"),
    caption: z.string().optional()
});

module.exports = { sendMediaMessageSchema }
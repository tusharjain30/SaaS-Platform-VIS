const { z } = require("zod");

const sendTextMessageSchema = z.object({
        to: z.string({
            required_error: "To is required"
        }).min(10, "Invalid phone number").max(10, "Invalid phone number"),
        message: z.string({
            required_error: "Message is required"
        }).min(1, "Message cannot be empty")
});

module.exports = { sendTextMessageSchema }
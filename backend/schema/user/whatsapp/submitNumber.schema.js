const { z } = require("zod");

const submitWhatsappNumberSchema = z.object({
    phone: z
        .string({ required_error: "Phone number is required" })
        .min(10, "Invalid phone number")
        .max(15, "Invalid phone number")
});

module.exports = { submitWhatsappNumberSchema };

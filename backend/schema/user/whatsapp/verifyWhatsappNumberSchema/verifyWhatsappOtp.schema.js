const { z } = require("zod");

const verifyWhatsappOtpSchema = z.object({
    otp: z
        .string({required_error: "Otp is required"})
        .min(4, "Invalid OTP")
        .max(6, "Invalid OTP")
});

module.exports = {verifyWhatsappOtpSchema};
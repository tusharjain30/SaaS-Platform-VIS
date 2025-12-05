const { z } = require("zod");

const userLoginSchema = z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email"),
    password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 chars"),
    rememberMe: z.boolean().optional(),
});

module.exports = { userLoginSchema };
const { z } = require("zod");

const userRegisterSchema = z.object({
    name: z.string({ required_error: "Name is required" }).min(3, "Name must be at least 3 characters"),
    email: z.string({ required_error: "Email is required" }).email("Invalid email"),
    phone: z.string({ required_error: "Phone is required" }).min(10, "Phone must be valid"),
    password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
    userName: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be at most 30 characters").optional(),
});

module.exports = { userRegisterSchema };

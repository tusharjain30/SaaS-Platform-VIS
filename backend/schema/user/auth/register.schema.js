const { z } = require("zod");

const userRegisterSchema = z.object({
    companyName: z.string({
        required_error: "Company name is required"
    }).min(2, "Company name must be at least 2 characters"),

    firstName: z.string({
        required_error: "First Name is required"
    }).min(2, "First Name must be at least 2 characters"),

    lastName: z.string({
        required_error: "Last Name is required"
    }).min(2, "Last Name must be at least 2 characters"),

    userName: z.string({
        required_error: "Username is required",
    })
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(
            /^[a-zA-Z0-9._]+$/,
            "Username can contain only letters, numbers, dot (.) and underscore (_)"
        ),

    email: z.string({
        required_error: "Email is required"
    }).email("Invalid email"),

    phone: z.string({
        required_error: "Phone number is required"
    }).min(10, "Invalid phone number").max(10, "Invalid phone number"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

module.exports = { userRegisterSchema };

const express = require("express");
const RESPONSE_CODES = require("../../../config/responseCode");
const router = express.Router();
const { PrismaClient } = require("../../../generated/prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
    try {

        const { name, email, phone, password } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }]
            }
        });

        if (existingUser) {
            return res.status(RESPONSE_CODES.ALREADY_EXIST).json({
                status: 0,
                message: "Email or Phone already exists",
                statusCode: RESPONSE_CODES.ALREADY_EXIST,
                data: {}
            })
        }

        let role = await prisma.role.findFirst({
            where: { roleType: "CUSTOMER_USER" }
        });

        if (!role) {
            role = await prisma.role.create({
                data: {
                    name: "CUSTOMER_USER",
                    roleType: "CUSTOMER_USER"
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                roleId: role.id,
            }
        });

        const { password: _, ...safeUser } = newUser;

        res.status(RESPONSE_CODES.POST).json({
            status: 1,
            message: "User registered successfully",
            statusCode: RESPONSE_CODES.POST,
            data: safeUser
        });

    } catch (error) {
        console.log("User Register Error:", err);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
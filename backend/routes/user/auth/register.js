const RESPONSE_CODES = require("../../../config/responseCode");

const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../generated/prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
    try {

        const {
            companyName,
            firstName,
            lastName,
            email,
            phone,
            password,
            userName,
            termsAccepted
        } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone },
                    { userName }
                ],
            },
        });

        if (existingUser) {
            return res.status(RESPONSE_CODES.ALREADY_EXIST).json({
                status: 0,
                message: "Email, Phone, Username already exists",
                statusCode: RESPONSE_CODES.ALREADY_EXIST,
                data: {}
            })
        }

        let role = await prisma.role.findFirst({
            where: { roleType: "CUSTOMER_OWNER" }
        });

        if (!role) {
            role = await prisma.role.create({
                data: {
                    name: "CUSTOMER_OWNER",
                    roleType: "CUSTOMER_OWNER"
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            const account = await tx.customerAccount.create({
                data: {
                    companyName,
                },
            });

            const user = await tx.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    userName,
                    password: hashedPassword,
                    roleId: role.id,
                    accountId: account.id,
                    termsAccepted
                },
            });

            return { account, user };
        });

        const { password: _, ...safeUser } = result.user;

        res.status(RESPONSE_CODES.POST).json({
            status: 1,
            message: "User registered successfully",
            statusCode: RESPONSE_CODES.POST,
            data: {
                account: result.account,
                owner: safeUser
            },
        });

    } catch (error) {
        console.log("User Register Error:", err);
        // Prisma unique constraint error
        if (error.code === "P2002") {
            return res.status(RESPONSE_CODES.ALREADY_EXIST).json({
                status: 0,
                message: "Duplicate field value",
                statusCode: RESPONSE_CODES.ALREADY_EXIST,
                data: error.meta,
            });
        }

        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
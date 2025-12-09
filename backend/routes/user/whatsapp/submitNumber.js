const { PrismaClient } = require("../../../generated/prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const router = express.Router();

const RESPONSE_CODES = require("../../../config/responseCode");
const sendEmail = require("../../../utils/sendEmail");

router.post("/", async (req, res) => {
    try {

        const user = req.user;
        const { phone } = req.body;

        if (user.wabaVerification?.status === "VERIFIED") {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Whatsapp number already verified",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // save otp in db
        await prisma.wabaVerification.upsert({
            where: { userId: user.id },
            update: {
                clientPhone: phone,
                otp,
                status: "PENDING"
            },
            create: {
                userId: user.id,
                clientPhone: phone,
                otp,
                status: "PENDING"
            }
        });

        await sendEmail(
            user.email,
            "WhatsApp Verification OTP",
            `
        <p>Your OTP for WhatsApp number verification is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
      `
        );

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "OTP sent successfully for whatsapp  verification",
            statusCode: RESPONSE_CODES.GET,
            data: {}
        });

    } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        })
    }
});

module.exports = router;
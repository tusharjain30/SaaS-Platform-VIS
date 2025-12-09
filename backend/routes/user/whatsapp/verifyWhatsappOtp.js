const RESPONSE_CODES = require("../../../config/responseCode");
const { PrismaClient } = require("../../../generated/prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const user = req.user;
        const { otp } = req.body;

        if (!user.wabaVerification) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Whatsapp number not submitted",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        if (user.wabaVerification.status === "VERIFIED") {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Whatsapp number already verified",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            })
        }

        if (user.wabaVerification.otp !== otp) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Invalid OTP",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            })
        }

        await prisma.wabaVerification.update({
            where: { userId: user.id },
            data: {
                status: "VERIFIED",
                otp: null
            }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Whatsapp number verified successfuly",
            statusCode: RESPONSE_CODES.GET,
            data: {}
        });

    } catch (error) {
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        })
    }
});

module.exports = router;
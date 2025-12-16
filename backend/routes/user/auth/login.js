const RESPONSE_CODES = require("../../../config/responseCode");

const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../generated/prisma/client");
const prisma = new PrismaClient();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const sendEmail = require("../../../utils/sendEmail");

router.post("/", async (req, res) => {
    try {

        const { email, password, rememberMe } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        if (!user) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Invalid email or Password",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Invalid email or Password",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            })
        }

        // If user not verified, Send OTP
        if (!user.isVerified) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins;

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    otp,
                    otpExpires
                }
            });

            await sendEmail(
                user.email,
                "Your OTP for Verification",
                `<h2>Your OTP is: <b>${otp}</b></h2>`
            );

            return res.status(RESPONSE_CODES.GET).json({
                status: 1,
                message: "OTP sent to email, Please verify",
                statusCode: RESPONSE_CODES.GET,
                data: {
                    needVerification: true,
                    email: user.email,
                    rememberMe
                }
            });
        }

        // If already verified, Generate JWT token
        const expiresIn = rememberMe ? process.env.USER_JWT_EXPIRATION : "1h";

        const token = jwt.sign(
            {
                userId: user.id,
                roleType: user.role?.roleType || "CUSTOMER_USER",
                tokenVersion: user.tokenVersion,
            },
            process.env.USER_JWT_SECRET,
            { expiresIn }
        );

        const { password: _, otp: __, otpExpires: ___, ...safeUser } = user;

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Login Successful",
            statusCode: RESPONSE_CODES.GET,
            data: {
                user: safeUser,
                token,
                expiresIn
            }
        });

    } catch (error) {
        res.status(RESPONSE_CODES.ERROR).json({
            status: 1,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        })
    }
});

module.exports = router;
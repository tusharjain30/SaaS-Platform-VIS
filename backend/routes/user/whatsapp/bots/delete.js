const RESPONSE_CODES = require("../../../../config/responseCode");

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.delete("/", async (req, res) => {
    try {

        const userId = req.user.id;
        const { id } = req.body;

        const bot = await prisma.bot.findFirst({
            where: {
                id,
                userId,
                isDeleted: false
            }
        });

        if (!bot) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "Bot not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {}
            })
        }

        await prisma.bot.update({
            where: { id },
            data: {
                isDeleted: true,
                isActive: false
            }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Bot deleted successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {}
        });

    } catch (error) {
        console.log("Delete bot error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        })
    }
});

module.exports = router;
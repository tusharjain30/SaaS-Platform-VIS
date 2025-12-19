const RESPONSE_CODES = require("../../../../config/responseCode");

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {

        const userId = req.user.id;
        const { id } = req.body;

        const bot = await prisma.bot.findFirst({
            where: {
                id,
                userId,
                isDeleted: false
            },
            select: {
                id: true,
                name: true,
                botType: true,
                triggerType: true,
                triggerValue: true,
                flow: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,

                templates: {
                    select: {
                        templateId: true,
                        template: {
                            select: {
                                id: true,
                                name: true,
                                language: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

        if (!bot) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "Bot not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {}
            });
        }

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Bot fetched successfully",
            statusCode: RESPONSE_CODES.GET,
            data: bot
        });

    } catch (error) {
        console.log("Get bot by id error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Failed to fetch bot",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
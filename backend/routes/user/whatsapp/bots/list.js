const RESPONSE_CODES = require("../../../../config/responseCode");

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {

        const userId = req.apiContext.userId;

        const {
            page,
            limit,
            search,
            botType,
            triggerType,
            isActive,
        } = req.validatedQuery;
        console.log(page, limit)

        const skip = (page - 1) * limit;

        const where = {
            userId,
            isDeleted: false,
            ...(typeof isActive === "boolean" && { isActive }),
            ...(botType && { botType }),
            ...(triggerType && { triggerType }),
            ...(search && {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            }),
        };

        const [bots, total] = await Promise.all([
            prisma.bot.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    botType: true,
                    triggerType: true,
                    triggerValue: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
            prisma.bot.count({ where }),
        ]);

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Bots fetched successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                list: bots,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });

    } catch (error) {
        console.log("Get bot list error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Failed to fetch bots",
            statucCode: RESPONSE_CODES.ERROR,
            data: {}
        })
    }
});

module.exports = router;
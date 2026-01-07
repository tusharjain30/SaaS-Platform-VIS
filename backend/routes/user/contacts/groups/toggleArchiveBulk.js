const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.patch("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupIds } = req.body;

        // Fetch all groups of this user
        const groups = await prisma.contactGroup.findMany({
            where: {
                id: { in: groupIds },
                userId,
                isDeleted: false
            }
        });

        if (!groups.length) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "No valid groups found",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Toggle each group
        const updates = groups.map(g =>
            prisma.contactGroup.update({
                where: { id: g.id },
                data: { isArchived: !g.isArchived }
            })
        );

        await prisma.$transaction(updates);

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Selected groups archive status toggled successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                updatedCount: groups.length
            }
        });

    } catch (error) {
        console.log("Bulk toggle archive error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
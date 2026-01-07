const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.delete("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupIds } = req.body;

        // Fetch only valid groups of this user
        const groups = await prisma.contactGroup.findMany({
            where: {
                id: { in: groupIds },
                userId,
                isDeleted: false
            },
            select: { id: true }
        });

        if (!groups.length) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "No valid groups found to delete",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {}
            });
        }

        const validGroupIds = groups.map(g => g.id);

        await prisma.$transaction([
            // 1. Soft delete groups
            prisma.contactGroup.updateMany({
                where: { id: { in: validGroupIds } },
                data: {
                    isDeleted: true,
                    isArchived: false
                }
            }),

            // 2. Remove mappings
            prisma.contactGroupMap.deleteMany({
                where: { groupId: { in: validGroupIds } }
            })
        ]);

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Groups deleted successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                deletedCount: validGroupIds.length
            }
        });

    } catch (error) {
        console.log("Bulk delete groups error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
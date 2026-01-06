const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.delete("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { contactIds } = req.body;

        if (!Array.isArray(contactIds) || contactIds.length === 0) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "contactIds array is required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Only delete user's own contacts
        const result = await prisma.contact.updateMany({
            where: {
                id: { in: contactIds },
                userId,
                isDeleted: false
            },
            data: {
                isDeleted: true
            }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Contacts deleted successfully",
            statusCode: RESPONSE_CODES.GET,
            data: { deletedCount: result.count }
        });

    } catch (err) {
        console.error("Bulk delete contacts error:", err);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
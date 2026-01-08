const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.delete("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { fieldId } = req.body;

        /* ---------- CHECK FIELD EXISTS & BELONGS TO USER ---------- */
        const field = await prisma.contactCustomField.findFirst({
            where: {
                id: fieldId,
                userId,
                isDeleted: false,
            },
        });

        if (!field) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "Custom field not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {},
            });
        }

        /* ---------- TRANSACTION: DELETE VALUES + FIELD ---------- */
        await prisma.$transaction(async (tx) => {
            // Delete all values of this field
            await tx.contactCustomValue.deleteMany({
                where: {
                    fieldId: fieldId,
                },
            });

            // Soft delete field (recommended)
            await tx.contactCustomField.update({
                where: { id: fieldId },
                data: {
                    isDeleted: true,
                },
            });
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Custom field and its values deleted successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {},
        });

    } catch (err) {
        console.error("Delete Custom Field Error:", err);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {},
        });
    }
});

module.exports = router;
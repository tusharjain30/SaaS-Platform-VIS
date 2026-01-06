const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.delete("/", async (req, res) => {
    try {
        const userId = req.user.id;
        let body = req.body;
        let contactId = Number(body.contactId);

        if (!contactId) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Contact id is required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Check contact belongs to user
        const contact = await prisma.contact.findFirst({
            where: {
                id: contactId,
                userId,
                isDeleted: false
            }
        });

        if (!contact) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "Contact not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {}
            });
        }

        // Soft delete
        await prisma.contact.update({
            where: { id: contactId },
            data: { isDeleted: true }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Contact deleted successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {}
        });

    } catch (err) {
        console.error("Delete contact error:", err);
        res.status(500).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
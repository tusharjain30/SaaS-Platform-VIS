const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.delete("/groups", async (req, res) => {
    try {
        const { userId } = req.apiContext;
        let { groupIds, contactId } = req.body;
        contactId = Number(contactId);

        if (!contactId || !Array.isArray(groupIds) || groupIds.length === 0) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "contactId and groupIds[] are required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Check contact
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

        // Delete relations
        await prisma.contactGroupMap.deleteMany({
            where: {
                contactId,
                groupId: { in: groupIds }
            }
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Groups removed successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {}
        });

    } catch (err) {
        console.error("Remove group error:", err);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
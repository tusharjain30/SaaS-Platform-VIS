const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.post("/groups", async (req, res) => {
    try {
        const userId = req.user.id;
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
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Contact not found",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Check groups
        const groups = await prisma.contactGroup.findMany({
            where: {
                id: { in: groupIds },
                userId
            }
        });

        if (groups.length !== groupIds.length) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "One or more groups not found",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Create mappings
        await prisma.contactGroupMap.createMany({
            data: groupIds.map(groupId => ({
                contactId,
                groupId
            })),
            skipDuplicates: true
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Groups assigned successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {}
        });

    } catch (err) {
        console.error("Assign group error:", err);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            status: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
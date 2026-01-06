const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.post("/assign-group", async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupId, contactIds } = req.body;

        if (!groupId) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "groupId is required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        if (!Array.isArray(contactIds) || contactIds.length === 0) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "contactIds array is required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        /* ---------------- VERIFY GROUP ---------------- */
        const group = await prisma.contactGroup.findFirst({
            where: {
                id: groupId,
                userId
            }
        });

        if (!group) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "Group not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {}
            });
        }

        /* ---------------- VERIFY CONTACTS ---------------- */
        const validContacts = await prisma.contact.findMany({
            where: {
                id: { in: contactIds },
                userId,
                isDeleted: false
            },
            select: { id: true }
        });

        if (validContacts.length === 0) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "No valid contacts found",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        const validContactIds = validContacts.map(c => c.id);

        /* ---------------- BUILD MAPPINGS ---------------- */
        const mappings = validContactIds.map(contactId => ({
            contactId,
            groupId
        }));

        /* ---------------- INSERT (SKIP DUPLICATES) ---------------- */
        const result = await prisma.contactGroupMap.createMany({
            data: mappings,
            skipDuplicates: true
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Group assigned to selected contacts successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                assignedCount: result.count
            }
        });

    } catch (err) {
        console.error("Assign group error:", err);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
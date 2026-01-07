const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupId } = req.body;

        const group = await prisma.contactGroup.findFirst({
            where: {
                id: groupId,
                userId,
                isDeleted: false,
            },
            include: {
                contacts: {
                    include: {
                        contact: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                                email: true,
                                country: true,
                                languageCode: true,
                                isOptedOut: true,
                                createdAt: true,
                            },
                        },
                    },
                },
            },
        });

        if (!group) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "Group not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {},
            });
        }

        // Flatten contacts
        const contacts = group.contacts.map((c) => c.contact);

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Group detail fetched successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                id: group.id,
                title: group.title,
                description: group.description,
                isArchived: group.isArchived,
                createdAt: group.createdAt,
                contacts,
                totalContacts: contacts.length,
            },
        });
    } catch (error) {
        console.error("Group detail error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {},
        });
    }
});

module.exports = router;
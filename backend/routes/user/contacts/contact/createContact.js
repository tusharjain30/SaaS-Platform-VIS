const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            firstName,
            lastName,
            country,
            phone,
            languageCode,
            email,
            isOptedOut = false,
            groups = [],
            customFields = {}
        } = req.body;

        // check duplicate phone
        const exists = await prisma.contact.findFirst({
            where: { userId, phone }
        });

        if (exists) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Contact already exists",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        const contact = await prisma.$transaction(async (tx) => {

            // Create contact
            const created = await tx.contact.create({
                data: {
                    userId,
                    firstName,
                    lastName,
                    country,
                    phone,
                    languageCode,
                    email,
                    isOptedOut
                }
            });

            // Validate group IDs
            if (groups.length) {
                const existingGroups = await tx.contactGroup.findMany({
                    where: {
                        userId,
                        id: { in: groups }
                    },
                    select: { id: true }
                });

                const existingGroupIds = existingGroups.map(g => g.id);

                const invalidGroupIds = groups.filter(
                    id => !existingGroupIds.includes(id)
                );

                if (invalidGroupIds.length) {
                    throw new Error("INVALID_GROUP_IDS:" + invalidGroupIds.join(","));
                }

                // Attach groups
                await tx.contactGroupMap.createMany({
                    data: existingGroupIds.map(gid => ({
                        contactId: created.id,
                        groupId: gid
                    })),
                    skipDuplicates: true
                });
            }

            // Handle custom fields
            for (const key of Object.keys(customFields)) {

                const field = await tx.contactCustomField.findFirst({
                    where: { userId, key }
                });

                if (!field) continue;

                await tx.contactCustomValue.create({
                    data: {
                        contactId: created.id,
                        fieldId: field.id,
                        value: String(customFields[key])
                    }
                });
            }

            return created;
        });

        res.status(RESPONSE_CODES.POST).json({
            status: 1,
            message: "Contact created successfully",
            statusCode: RESPONSE_CODES.POST,
            data: contact
        });

    } catch (error) {
        if (error.message?.startsWith("INVALID_GROUP_IDS:")) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Some group IDs are invalid",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {
                    invalidGroupIds: error.message.replace("INVALID_GROUP_IDS:", "").split(",")
                }
            });
        }
        console.log("Create Contact Error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
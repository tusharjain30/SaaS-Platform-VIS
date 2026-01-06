const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.put("/", async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            contactId,
            firstName,
            lastName,
            country,
            languageCode,
            email,
            isOptedOut,
            groups = [],
            customFields = {}
        } = req.body;

        // Check contact exists
        const contact = await prisma.contact.findFirst({
            where: { id: contactId, userId, isDeleted: false }
        });

        if (!contact) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json(
                {
                    status: 0,
                    message: "Contact not found",
                    statusCode: RESPONSE_CODES.NOT_FOUND,
                    data: {}
                });
        };

        const result = await prisma.$transaction(async (tx) => {

            // Update main contact
            const updated = await tx.contact.update({
                where: { id: contactId },
                data: {
                    ...(firstName !== undefined && { firstName }),
                    ...(lastName !== undefined && { lastName }),
                    ...(country !== undefined && { country }),
                    ...(languageCode !== undefined && { languageCode }),
                    ...(email !== undefined && { email }),
                    ...(isOptedOut !== undefined && { isOptedOut })
                }
            });

            // Update groups (replace)
            if (groups.length) {
                const existingGroups = await tx.contactGroup.findMany({
                    where: { userId, id: { in: groups } },
                    select: { id: true }
                });

                const validIds = existingGroups.map(g => g.id);
                const invalid = groups.filter(id => !validIds.includes(id));

                if (invalid.length) {
                    throw new Error("INVALID_GROUP_IDS:" + invalid.join(","));
                }

                await tx.contactGroupMap.deleteMany({
                    where: { contactId }
                });

                await tx.contactGroupMap.createMany({
                    data: validIds.map(gid => ({
                        contactId,
                        groupId: gid
                    }))
                });
            }

            // Update custom fields
            if (customFields && Object.keys(customFields).length) {
                await tx.contactCustomValue.deleteMany({
                    where: { contactId }
                });

                const fields = await tx.contactCustomField.findMany({
                    where: { userId }
                });

                const fieldMap = new Map(fields.map(f => [f.key, f.id]));

                const inserts = [];

                for (const [key, value] of Object.entries(customFields)) {
                    const fieldId = fieldMap.get(key);
                    if (!fieldId) continue; // ignore unknown keys

                    inserts.push({
                        contactId,
                        fieldId,
                        value: String(value)
                    });

                }

                if (inserts.length) {
                    await tx.contactCustomValue.createMany({ data: inserts });
                }
            }

            return updated;
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Contact updated successfully",
            statusCode: RESPONSE_CODES.GET,
            data: result
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

        console.log("Update contact error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
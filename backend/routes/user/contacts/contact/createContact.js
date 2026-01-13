const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    try {
        const { userId, accountId } = req.auth;

        const {
            firstName,
            lastName,
            country,
            phone,
            languageCode,
            email,
            isOptedOut,
            groups,
            customFields
        } = req.body;


        /* ===============================
           DUPLICATE CHECK (PER ACCOUNT)
        =============================== */
        const exists = await prisma.contact.findFirst({
            where: {
                accountId,
                phone,
                isDeleted: false
            }
        });

        if (exists) {
            return res.status(RESPONSE_CODES.ALREADY_EXIST).json({
                status: 0,
                message: "Contact with this phone already exists",
                statusCode: RESPONSE_CODES.ALREADY_EXIST,
                data: {}
            });
        }

        /* ===============================
           CREATE IN TRANSACTION
        =============================== */
        const result = await prisma.$transaction(async (tx) => {

            /* CREATE CONTACT */
            const contact = await tx.contact.create({
                data: {
                    accountId,
                    createdByUserId: userId,
                    firstName,
                    lastName,
                    country,
                    phone,
                    languageCode,
                    email,
                    isOptedOut: isOptedOut ?? false
                }
            });

            /* ASSIGN GROUPS */
            if (Array.isArray(groups) && groups.length) {

                const validGroups = await tx.contactGroup.findMany({
                    where: {
                        accountId,
                        id: { in: groups },
                        isDeleted: false
                    },
                    select: { id: true }
                });

                const validIds = validGroups.map(g => g.id);
                const invalid = groups.filter(id => !validIds.includes(id));

                if (invalid.length) {
                    throw new Error("INVALID_GROUP_IDS:" + invalid.join(","));
                }

                await tx.contactGroupMap.createMany({
                    data: validIds.map(gid => ({
                        contactId: contact.id,
                        groupId: gid
                    }))
                });
            }

            /* SAVE CUSTOM FIELDS */
            if (customFields && typeof customFields === "object") {

                const keys = Object.keys(customFields);

                if (keys.length) {
                    const fields = await tx.contactCustomField.findMany({
                        where: {
                            accountId,
                            key: { in: keys },
                            isDeleted: false
                        }
                    });

                    const fieldMap = new Map(fields.map(f => [f.key, f.id]));

                    const invalidKeys = keys.filter(k => !fieldMap.has(k));
                    if (invalidKeys.length) {
                        throw new Error("INVALID_CUSTOM_FIELDS:" + invalidKeys.join(","));
                    }

                    await tx.contactCustomValue.createMany({
                        data: keys.map(key => ({
                            contactId: contact.id,
                            fieldId: fieldMap.get(key),
                            value: String(customFields[key])
                        }))
                    });
                }
            }

            /* RETURN FULL CONTACT */
            return tx.contact.findFirst({
                where: { id: contact.id },
                include: {
                    groups: {
                        include: { group: true }
                    },
                    customValues: {
                        include: { field: true }
                    }
                }
            });
        });

        res.status(RESPONSE_CODES.POST).json({
            status: 1,
            message: "Contact created successfully",
            statusCode: RESPONSE_CODES.POST,
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

        if (error.message?.startsWith("INVALID_CUSTOM_FIELDS:")) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Some custom field keys are invalid",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {
                    invalidKeys: error.message.replace("INVALID_CUSTOM_FIELDS:", "").split(",")
                }
            });
        }

        console.error("Create contact error:", error);

        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

const fs = require("fs");
const csv = require("csv-parser");

const uploadCsv = require("../../../../middleware/uploadCsv");

router.post("/", (req, res, next) => {
    uploadCsv.single("file")(req, res, function (err) {
        if (err) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: err.message,
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }
        next();
    })
}, async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            status: 0,
            message: "CSV file is required",
            statusCode: RESPONSE_CODES.BAD_REQUEST,
            data: {}
        });
    }

    const groupIds = req.body.groupIds
        ? req.body.groupIds.split(",").map(Number)
        : [];

    let total = 0;
    let inserted = 0;
    let skipped = 0;

    const contactsToInsert = [];

    try {
        /* ---------------- VERIFY GROUPS ---------------- */
        let validGroupIds = [];
        if (groupIds.length) {
            const groups = await prisma.contactGroup.findMany({
                where: {
                    id: { in: groupIds },
                    userId
                },
                select: { id: true }
            });
            validGroupIds = groups.map(g => g.id);
        }

        /* ---------------- READ CSV ---------------- */
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (row) => {
                total++;

                const phone = row.phone?.trim();
                if (!phone) {
                    skipped++;
                    return;
                }

                contactsToInsert.push({
                    userId,
                    phone,
                    firstName: row.firstName || null,
                    lastName: row.lastName || null,
                    email: row.email || null,
                    country: row.country || null,
                    languageCode: row.languageCode || null,
                    isOptedOut: row.isOptedOut || false
                });
            })
            .on("end", async () => {
                /* ---------------- PROCESS INSERT ---------------- */
                for (const contact of contactsToInsert) {
                    // Check duplicate
                    const exists = await prisma.contact.findFirst({
                        where: {
                            phone: contact.phone,
                            userId,
                            isDeleted: false
                        }
                    });

                    if (exists) {
                        skipped++;
                        continue;
                    }

                    const created = await prisma.contact.create({
                        data: contact
                    });

                    inserted++;

                    // Assign groups
                    if (validGroupIds.length) {
                        await prisma.contactGroupMap.createMany({
                            data: validGroupIds.map(groupId => ({
                                contactId: created.id,
                                groupId
                            })),
                            skipDuplicates: true
                        });
                    }
                }

                // Delete file
                fs.unlinkSync(req.file.path);

                res.status(RESPONSE_CODES.POST).json({
                    status: 1,
                    message: "Contacts imported successfully",
                    statusCode: RESPONSE_CODES.POST,
                    data: {
                        summary: {
                            total,
                            inserted,
                            skipped
                        }
                    }
                });
            });

    } catch (err) {
        console.error("Import contacts error:", err);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
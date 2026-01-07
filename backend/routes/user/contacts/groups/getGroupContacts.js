const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupId, page = 1, limit = 20, search } = req.body;

        const skip = (page - 1) * limit;

        /* ---------------- CHECK GROUP ---------------- */
        const group = await prisma.contactGroup.findFirst({
            where: {
                id: groupId,
                userId,
                isDeleted: false
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

        /* ---------------- FILTER ---------------- */
        const contactWhere = {
            isDeleted: false,
            ...(search && {
                OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } }
                ]
            })
        };

        /* ---------------- QUERY ---------------- */
        const [rows, total] = await Promise.all([
            prisma.contactGroupMap.findMany({
                where: {
                    groupId,
                    contact: contactWhere
                },
                skip,
                take: limit,
                orderBy: {
                    id: "desc"
                },
                include: {
                    contact: {
                        include: {
                            customValues: {
                                include: {
                                    field: true
                                }
                            }
                        }
                    }
                }
            }),

            prisma.contactGroupMap.count({
                where: {
                    groupId,
                    contact: contactWhere
                }
            })
        ]);

        const contacts = rows.map(r => r.contact);

        /* ---------------- RESPONSE ---------------- */
        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Group contacts fetched successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                items: contacts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.log("Get group contacts error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
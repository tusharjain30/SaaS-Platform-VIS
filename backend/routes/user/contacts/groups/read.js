const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            page = 1,
            limit = 10,
            search,
            isArchived,
            isDeleted = false
        } = req.body;

        const skip = (page - 1) * limit;

        const where = {
            userId,
            isDeleted,
            ...(typeof isArchived === "boolean" && { isArchived }),
            ...(search && {
                title: {
                    contains: search,
                    mode: "insensitive"
                }
            })
        };

        const [groups, total] = await Promise.all([
            prisma.contactGroup.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: {
                            contacts: true
                        }
                    }
                }
            }),
            prisma.contactGroup.count({ where })
        ]);

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Groups fetched successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                items: groups.map(g => ({
                    id: g.id,
                    title: g.title,
                    description: g.description,
                    isArchived: g.isArchived,
                    isDeleted: g.isDeleted,
                    createdAt: g.createdAt,
                    contactsCount: g._count.contacts
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.log("Read groups error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
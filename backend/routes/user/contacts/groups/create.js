const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    try {
        const { accountId, userId } = req.auth;
        const { title, description } = req.body;

        // Check duplicate group name for same user
        const existing = await prisma.contactGroup.findFirst({
            where: {
                accountId,
                title: {
                    equals: title,
                    mode: "insensitive"
                },
                isDeleted: false
            }
        });

        if (existing) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Group with this title already exists",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        const group = await prisma.contactGroup.create({
            data: {
                accountId,
                title,
                description,
                createdByUserId: userId
            }
        });

        res.status(RESPONSE_CODES.POST).json({
            status: 1,
            message: "Group created successfully",
            statusCode: RESPONSE_CODES.POST,
            data: group
        });

    } catch (error) {
        console.log("Create Group Error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
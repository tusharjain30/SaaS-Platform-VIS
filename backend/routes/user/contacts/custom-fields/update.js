const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.put("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const { fieldId, name, type } = req.body;

        // Check field exists & belongs to user
        const field = await prisma.contactCustomField.findFirst({
            where: {
                id: fieldId,
                userId,
                isDeleted: false
            },
        });

        if (!field) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                status: 0,
                message: "Custom field not found",
                statusCode: RESPONSE_CODES.NOT_FOUND,
                data: {},
            });
        }

        const existsName = await prisma.contactCustomField.findFirst({
            where: {
                userId,
                id: {
                    not: fieldId
                },
                name: {
                    equals: name,
                    mode: "insensitive"
                },
                isDeleted: false
            }
        });

        if (existsName) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Custom field with this name already exists",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Update 
        const updated = await prisma.contactCustomField.update({
            where: { id: fieldId },
            data: {
                name,
                type,
            },
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Custom field updated successfully",
            statusCode: RESPONSE_CODES.GET,
            data: updated,
        });

    } catch (err) {
        console.error("Update Custom Field Error:", err);
        return res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {},
        });
    }
});

module.exports = router;
const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const { accountId } = req.auth;
        const { search } = req.validatedQuery || {};

        const where = {
            accountId,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { key: { contains: search, mode: "insensitive" } },
                ],
            }),
            isDeleted: false
        };

        const fields = await prisma.contactCustomField.findMany({
            where,
            orderBy: { id: "desc" },
        });

        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Custom fields list fetched successfully",
            statusCode: RESPONSE_CODES.GET,
            data: fields,
        });

    } catch (err) {
        console.error("Custom Field List Error:", err);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {},
        });
    }
});

module.exports = router;
const RESPONSE_CODES = require("../../../../config/responseCode");
const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();
const submitTemplateToMeta = require("../../../../services/Meta/metaTemplate.service");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const { userId, accessTokenId } = req.apiContext;
        const { name, category, language = "en_US", body, variables } = req.body;

        const exists = await prisma.template.findFirst({
            where: {
                userId,
                name,
                language,
                isDeleted: false
            }
        });

        if (exists) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Template with same name already exists",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        const template = await prisma.template.create({
            data: {
                userId,
                name,
                category,
                language,
                body,
                variables,
                status: "SUBMITTED"
            }
        });

        submitTemplateToMeta(template).catch(err =>
            console.error("Meta submit failed:", err?.response?.data || err.message)
        );

        await prisma.accessToken.update({
            where: { id: accessTokenId },
            data: { usedValue: { increment: 1 } }
        });

        res.status(RESPONSE_CODES.POST).json({
            status: 1,
            message: "Template submitted for Meta approval",
            statusCode: RESPONSE_CODES.POST,
            data: {
                templateId: template.id,
                status: template.status
            }
        });

    } catch (error) {
        console.log("Create Template Error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        })
    }
});

module.exports = router;
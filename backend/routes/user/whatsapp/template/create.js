const RESPONSE_CODES = require("../../../../config/responseCode");
const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();
const submitTemplateToMeta = require("../../../../services/Meta/submitTemplateToMeta.service");
const express = require("express");
const router = express.Router();

const uploadMediaToMeta = require("../../../../services/Meta/uploadMediaToMeta");

//  VARIABLE EXTRACTOR ({{1}}, {{2}} only)
const extractVariables = (body) => {
    const regex = /\{\{\s*(\d+)\s*\}\}/g; // ONLY numeric placeholders
    const vars = [];
    let match;

    while ((match = regex.exec(body)) !== null) {
        vars.push(`{{${match[1]}}}`);
    }

    return vars.length ? vars : null;
};


router.post("/", async (req, res) => {
    try {

        const { userId, accessTokenId } = req.apiContext;
        const {
            name,
            category,
            language = "en_US",
            body,
            header,
            footer,
            buttons
        } = req.body;

        const exists = await prisma.template.findFirst({
            where: { userId, name, language, isDeleted: false }
        });

        if (exists) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Template with this name already exists",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        // Extract variables from body
        const variables = extractVariables(body);
        const components = [];

        // Header
        if (header) {
            switch (header.type) {
                case "TEXT":
                    components.push({
                        type: "HEADER",
                        format: "TEXT",
                        text: header.text
                    });
                    break;

                case "IMAGE":
                case "VIDEO":
                case "DOCUMENT": {
                    if (!req.file) {
                        return res.status(400).json({
                            status: 0,
                            message: `${header.type} header requires a media file upload`,
                            statusCode: 400,
                            data: {}
                        });
                    }

                    const mediaId = await uploadMediaToMeta({
                        filePath: req.file.path,
                        mimeType: req.file.mimetype,
                        phoneNumberId: process.env.PHONE_NUMBER_ID,
                        accessToken: process.env.WHATSAPP_ACCESS_TOKEN
                    });

                    components.push({
                        type: "HEADER",
                        format: header.type,
                        example: {
                            header_handle: [mediaId]
                        }
                    });
                    break;
                }

                case "LOCATION":
                    components.push({
                        type: "HEADER",
                        format: "LOCATION"
                    });
                    break;

                default:
                    return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                        status: 0,
                        message: "Invalid header type",
                        statusCode: RESPONSE_CODES.BAD_REQUEST,
                        data: {}
                    });
            }
        }

        // Body
        components.push({
            type: "BODY",
            text: body
        });

        // Footer
        if (footer?.text) {
            components.push({
                type: "FOOTER",
                text: footer.text
            });
        }

        // Buttons
        if (buttons?.length) {
            const metaButtons = buttons.map((btn) => {
                if (btn.type === "URL") {
                    return {
                        type: "URL",
                        text: btn.text,
                        url: btn.url
                    };
                }
                if (btn.type === "QUICK_REPLY") {
                    return {
                        type: "QUICK_REPLY",
                        text: btn.text
                    };
                }
                if (btn.type === "CALL") {
                    return {
                        type: "PHONE_NUMBER",
                        text: btn.text,
                        phone_number: btn.phoneNumber
                    };
                }
            });

            components.push({
                type: "BUTTONS",
                buttons: metaButtons
            });
        }

        // Submit to meta
        let metaResponse = null;
        try {
            metaResponse = await submitTemplateToMeta(
                name,
                category,
                language,
                components
            );
        } catch (err) {
            console.log("Meta submission failed:", err?.response?.data || err.message);
        }

        // Save to db
        const template = await prisma.$transaction(async (tx) => {
            const created = await tx.template.create({
                data: {
                    userId,
                    name,
                    category,
                    language,
                    body,
                    variables,
                    header,
                    footer,
                    buttons,
                    components,
                    status: "SUBMITTED",
                    metaTemplateId: metaResponse?.id || null
                }
            });

            await tx.accessToken.update({
                where: { id: accessTokenId },
                data: { usedValue: { increment: 1 } }
            });

            return created;
        });

        res.status(RESPONSE_CODES.POST).json({
            status: 1,
            message: "Template submitted for Meta approval",
            statusCode: RESPONSE_CODES.POST,
            data: template
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
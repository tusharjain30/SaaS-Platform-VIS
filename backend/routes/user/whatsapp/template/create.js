const RESPONSE_CODES = require("../../../../config/responseCode");
const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();
const submitTemplateToMeta = require("../../../../services/Meta/metaTemplate.service");
const express = require("express");
const router = express.Router();

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
            language,
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

        // extract variables from body
        const variables = extractVariables(body);

        const components = [];

        // Header
        if (header) {
            if (header.type === "TEXT") {
                components.push({
                    type: "HEADER",
                    format: "TEXT",
                    text: header.text
                });
            } else if (["IMAGE", "VIDEO", "DOCUMENT"].includes(header.type)) {
                components.push({
                    type: "HEADER",
                    format: header.type
                });
            } else if (header.type === "LOCATION") {
                components.push({
                    type: "HEADER",
                    format: "LOCATION"
                });
            }
        }

        // Body
        components.push({
            type: "BODY",
            text: body
        });

        // Footer
        if (footer) {
            components.push({
                type: "FOOTER",
                text: footer.text
            });
        }

        // Buttons
        if (buttons?.length) {
            const metaButtons = buttons.map(btn => {
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

        // Submit template to meta
        let metaTemplateId = null;

        try {
            const metaResponse = await submitTemplateToMeta(name, category, language, components);
            metaTemplateId = metaResponse?.id ?? null;
        } catch (err) {
            console.log("Meta submission failed:", err?.response?.data || err.message);
        }


        // Save template
        const newTemplate = await prisma.$transaction(async (tx) => {
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
                    metaTemplateId
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
            data: newTemplate
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
const RESPONSE_CODES = require("../../../../config/responseCode");
const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();
const submitTemplateToMeta = require("../../../../services/Meta/metaTemplate.service");
const express = require("express");
const router = express.Router();

const { buildMediaUrl } = require("../../../../utils/mediaUrl");

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
            buttons,
            location
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

        // Handle File Upload
        let fileUrl = null;
        if (req.file) {
            fileUrl = buildMediaUrl(req.uploadFolder, req.uploadedFileName);
        }

        // Build mediaFiles Json
        const mediaFiles = {
            image: req.file?.mimetype.startsWith("image") ? fileUrl : null,
            video: req.file?.mimetype.startsWith("video") ? fileUrl : null,
            document: req.file?.mimetype.includes("pdf") ? fileUrl : null,
            location: location ? JSON.parse(location) : null
        };

        // Validate media header
        if (header?.type && ["IMAGE", "VIDEO", "DOCUMENT"].includes(header.type)) {
            const hasFile = !!req.file;
            const hasUrl = !!header.url;

            if (!hasFile && !hasUrl) {
                return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                    status: 0,
                    message: `${header.type} header requires either a media file upload or a media URL`,
                    statusCode: RESPONSE_CODES.BAD_REQUEST,
                    data: {}
                });
            }
        }


        // Extract variables from body
        const variables = extractVariables(body);

        const components = [];

        // ---- HEADER ----
        if (header) {
            const mediaId = header.url || fileUrl;

            switch (header.type) {
                case "TEXT":
                    components.push({
                        type: "HEADER",
                        format: "TEXT",
                        text: header.text
                    });
                    break;

                case "IMAGE":
                    components.push({
                        type: "HEADER",
                        format: "IMAGE",
                        example: {
                            header_handle: [mediaId]
                        }
                    });
                    break;

                case "VIDEO":
                    components.push({
                        type: "HEADER",
                        format: "VIDEO"
                    });
                    break;

                case "DOCUMENT":
                    components.push({
                        type: "HEADER",
                        format: "DOCUMENT"
                    });
                    break;

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
                    mediaFiles,
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
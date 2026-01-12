const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const router = express.Router();
const RESPONSE_CODES = require("../../../../config/responseCode");
const sendWhatsAppMessage = require("../../../../services/Meta/sendMessage");
const uploadMediaToMeta = require("../../../../services/Meta/uploadMediaToMeta");
const { buildMediaPayload } = require("../../../../services/Meta/payloadBuilders");
const fs = require("fs");

router.post("/", async (req, res) => {
    try {
        const { userId, accountId } = req.auth;
        const { to, caption } = req.body;

        if (!req.file) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                status: 0,
                message: "Media file is required",
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                data: {}
            });
        }

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;

        // Detect media type
        let mediaType;
        if (mimeType.startsWith("image/")) mediaType = "IMAGE";
        else if (mimeType.startsWith("video/")) mediaType = "VIDEO";
        else mediaType = "DOCUMENT";

        // Upload to Meta
        const mediaId = await uploadMediaToMeta({
            filePath,
            mimeType
        });

        // Send message
        const metaResponse = await sendWhatsAppMessage({
            to: `91${to}`,
            payload: buildMediaPayload({
                mediaType,
                mediaId,
                caption
            })
        });

        // Save log
        await prisma.messageLog.create({
            data: {
                accountId,
                sentByUserId: userId,
                to,
                type: mediaType,
                direction: "OUTBOUND",
                payload: {
                    caption,
                    metaMediaId: mediaId
                },
                status: "SENT",
                metaMessageId: metaResponse.messages?.[0]?.id || null
            }
        });

        // Delete local file
        fs.unlinkSync(filePath);

        res.status(RESPONSE_CODES.POST).json({
            status: 1,
            message: "Media message sent successfully",
            statusCode: RESPONSE_CODES.POST,
            data: metaResponse
        });

    } catch (error) {
        console.error("Send media error:", error?.response?.data || error);
        res.status(500).json({
            status: 0,
            message: error?.response?.data?.error?.message || "Failed to send media"
        });
    }
});

module.exports = router;
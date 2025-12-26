const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

const sendWhatsAppMessage = require("../../../../services/Meta/sendMessage");

const {
    buildTextPayload,
    buildMediaPayload,
    buildButtonPayload,
    buildListPayload,
    buildCtaPayload
} = require("../../../../services/Meta/payloadBuilders");

const { buildTemplatePayload } = require("../../../../services/Meta/templatePayloadBuilder");
const resolveTrigger = require("../../../../services/Meta/triggerResolver.service");

module.exports = async (req, res) => {
    try {
        // WhatsApp requires immediate 200
        res.sendStatus(200);
        const entry = req.body.entry?.[0];
        if (!entry) return res.sendStatus(200);

        const change = entry.changes?.[0];
        if (!change) return res.sendStatus(200);

        const { field, value } = change;

        if (!value) return;


        // TEMPLATE STATUS UPDATES
        if (field === "message_template_status_update") {

            const {
                message_template_id,
                message_template_name,
                message_template_language,
                event,
                reason
            } = value;

            if (!["APPROVED", "REJECTED"].includes(event)) return;
            console.log("TEMPLATE STATUS UPDATE:", value);

            await prisma.template.updateMany({
                where: {
                    name: message_template_name,
                    language: message_template_language,
                    isDeleted: false
                },
                data: {
                    status: event === "APPROVED" ? "APPROVED" : "REJECTED",
                    metaTemplateId: message_template_id ?? null,
                    rejectReason: reason ?? null
                }
            });

            return;
        }


        /* ======================================================
             BOT INCOMING MESSAGE HANDLER
        ====================================================== */
        if (field !== "messages" || !value.messages?.length) return;
        if (field === "messages" && value.messages?.length) {
            const message = value.messages[0];
            const from = message.from;
            const text = message.text?.body?.toLowerCase() || null;
            const buttonPayload = message.button?.payload || null;
            const listPayload = message.interactive?.list_reply?.id || null;

            /* --------------------------------------------------
            FIND USER
            -------------------------------------------------- */
            const user = await prisma.user.findFirst({
                where: {
                    isActive: true,
                    wabaVerification: {
                        clientPhone: from
                    }
                }
            });
            if (!user) return;

            /* --------------------------------------------------
                    FIND ACTIVE BOT
            -------------------------------------------------- */
            const bot = await prisma.bot.findFirst({
                where: {
                    userId: user.id,
                    isActive: true,
                    isDeleted: false
                }
            });
            if (!bot) return;


            /* --------------------------------------------------
                FIND OR CREATE SESSION
            -------------------------------------------------- */
            let session = await prisma.botSession.findFirst({
                where: {
                    userId: user.id,
                    botId: bot.id,
                    contact: from,
                    isActive: true
                }
            });

            /* --------------------------------------------------
                New session (flow start)
           -------------------------------------------------- */
            if (!session) {
                session = await prisma.botSession.create({
                    data: {
                        userId: user.id,
                        botId: bot.id,
                        contact: from,
                        botType: bot.botType,
                        triggerType: "DEFAULT",
                        currentNodeKey: bot.entryNodeKey || "START"
                    }
                });
            }

            /* --------------------------------------------------
              FIND NEXT BOT REPLY (TRIGGER RESOLUTION)
          -------------------------------------------------- */
            const botReply = await prisma.botReply.findFirst({
                where: {
                    botId: bot.id,
                    isActive: true,
                    parentNodeKey: session.currentNodeKey,
                    OR: resolveTrigger({ text, buttonPayload, listPayload })
                },
                include: {
                    media: true,
                    buttons: true,
                    listMessage: {
                        include: {
                            sections: {
                                include: { rows: true }
                            }
                        }
                    },
                    ctaButton: true
                }
            });
            if (!botReply) {
                await sendWhatsAppMessage({
                    to: from,
                    payload: buildTextPayload("Sorry, I didn’t understand that. Please try again.")
                });
                return;
            }

            /* --------------------------------------------------
               BUILD WHATSAPP PAYLOAD
           -------------------------------------------------- */
            let payload;

            if (botReply.replyType === "SIMPLE") {
                payload = buildTextPayload(botReply.bodyText);
            }

            if (botReply.replyType === "MEDIA" && botReply.media) {
                payload = buildMediaPayload({
                    mediaType: botReply.media.mediaType,
                    mediaId: botReply.media.metaMediaId,
                    caption: botReply.bodyText
                });
            }

            if (botReply.replyType === "INTERACTIVE") {
                if (botReply.interactiveType === "REPLY_BUTTONS") {
                    payload = buildButtonPayload({
                        bodyText: botReply.bodyText,
                        buttons: botReply.buttons
                    });
                }

                if (botReply.interactiveType === "LIST") {
                    payload = buildListPayload({
                        bodyText: botReply.bodyText,
                        buttonLabel: botReply.listMessage.buttonLabel,
                        sections: botReply.listMessage.sections
                    });
                }

                if (botReply.interactiveType === "CTA_URL") {
                    payload = buildCtaPayload({
                        bodyText: botReply.bodyText,
                        text: botReply.ctaButton.displayText,
                        url: botReply.ctaButton.url
                    });
                }
            }

            if (botReply.replyType === "TEMPLATE") {
                payload = buildTemplatePayload({
                    name: botReply.templateName,
                    language: "en_US",
                    variables: botReply.variables || []
                });
            }

            /* --------------------------------------------------
               UPDATE SESSION STATE
           -------------------------------------------------- */
            await prisma.botSession.update({
                where: { id: session.id },
                data: {
                    previousNodeKey: session.currentNodeKey,
                    currentNodeKey: botReply.nextNodeKey || session.currentNodeKey,
                    isActive: !botReply.isEnd,
                    lastMessageAt: new Date()
                }
            });

            /* --------------------------------------------------
              SEND WHATSAPP MESSAGE
          -------------------------------------------------- */
            await sendWhatsAppMessage({
                to: from,
                payload
            });

            /* --------------------------------------------------
                    LOG MESSAGE
            -------------------------------------------------- */
            await prisma.messageLog.create({
                data: {
                    userId: user.id,
                    to: from,
                    type: payload.type.toUpperCase(),
                    direction: "OUTBOUND",
                    payload
                }
            });
        }

    } catch (error) {
        console.log("Meta webhook error:", error);
        return res.sendStatus(500);
    }
};

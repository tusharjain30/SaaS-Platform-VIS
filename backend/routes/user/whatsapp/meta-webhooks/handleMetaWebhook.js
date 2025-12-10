const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res) => {
    try {
        const change = req.body.entry?.[0]?.changes?.[0]?.value;
        if (!change) return res.sendStatus(200);

        // TEMPLATE STATUS UPDATE 
        if (change.event === "message_template_status_update") {
            const {
                message_template_name,
                message_template_language,
                event,
                reason,
                message_template_id
            } = change;

            await prisma.template.updateMany({
                where: {
                    name: message_template_name,
                    language: message_template_language,
                    isDeleted: false
                },
                data: {
                    status: event === "APPROVED" ? "APPROVED" : "REJECTED",
                    metaTemplateId: message_template_id || null,
                    rejectReason: reason || null
                }
            });
        }

        // MESSAGE DELIVERY STATUS (future ready) 
        // if (change.statuses?.length) {
        //     for (const s of change.statuses) {
        //         await prisma.messageLog.updateMany({
        //             where: { metaMessageId: s.id },
        //             data: { status: s.status }
        //         });
        //     }
        // }

        // INCOMING MESSAGE (bot trigger later)
        if (change.messages?.length) {
            // save inbound messages, trigger bot flows
        }

        return res.sendStatus(200);

    } catch (error) {
        console.error("Meta webhook error:", error);
        return res.sendStatus(500);
    }
};


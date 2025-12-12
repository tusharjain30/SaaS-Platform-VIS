const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res) => {
    try {
        const entry = req.body.entry?.[0];
        if (!entry) return res.sendStatus(200);

        const change = entry.changes?.[0];
        if (!change) return res.sendStatus(200);

        const { field, value } = change;

        // TEMPLATE STATUS UPDATES
        if (field === "message_template_status_update") {

            const {
                message_template_id,
                message_template_name,
                message_template_language,
                event,
                reason
            } = value;

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

            return res.sendStatus(200);
        }

        /* ----------------------------------------------
           INCOMING CUSTOMER MESSAGES (BOT TRIGGER)
        -----------------------------------------------*/
        if (field === "messages" && value.messages?.length) {
            // Save inbound messages for bot
            // Trigger bot logic later
        }

        return res.sendStatus(200);

    } catch (error) {
        console.error("Meta webhook error:", error);
        return res.sendStatus(500);
    }
};

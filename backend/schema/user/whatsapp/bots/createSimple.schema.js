const { z } = require("zod");

const createSimpleBotSchema = z.object({
    name: z.string().min(2, "Bot name is required"),

    replyText: z.string().min(1).optional(),

    triggerType: z.enum([
        "WELCOME",
        "DEFAULT",
        "IS",
        "STARTS_WITH",
        "ENDS_WITH",
        "CONTAINS_WORD",
        "CONTAINS",
        "STOP_PROMOTIONAL",
        "START_PROMOTIONAL",
        "START_AI_BOT",
        "STOP_AI_BOT",
        "BUTTON",
    ]),

    triggerValue: z.string().optional().nullable(),

    isActive: z.boolean().optional(),
}).superRefine((data, ctx) => {

    // SIMPLE reply must have text
    if (!data.replyText) {
        ctx.addIssue({
            path: ["replyText"],
            message: "Reply text is required for simple bot",
        });
    }

    // DEFAULT / WELCOME rules
    if (
        !["DEFAULT", "WELCOME"].includes(data.triggerType) &&
        !data.triggerValue
    ) {
        ctx.addIssue({
            path: ["triggerValue"],
            message: "Trigger value is required for this trigger type",
        });
    }

    if (
        ["DEFAULT", "WELCOME"].includes(data.triggerType) &&
        data.triggerValue
    ) {
        ctx.addIssue({
            path: ["triggerValue"],
            message: "Trigger value must be empty for DEFAULT/WELCOME trigger",
        });
    }
});

module.exports = { createSimpleBotSchema };

const { z } = require("zod");

const getAllBotsSchema = z.object({
    page: z
        .string()
        .default("1")
        .transform(v => Number(v))
        .refine(v => !v || v > 0, "Page must be greater than 0"),

    limit: z
        .string()
        .default("10")
        .transform(v => Number(v))
        .refine(v => !v || v > 0, "Limit must be greater than 0"),

    search: z.string().optional(),

    botType: z.enum(["SIMPLE", "MEDIA", "ADVANCE"]).optional(),

    triggerType: z.enum([
        "DEFAULT",
        "KEYWORD",
        "BUTTON",
        "WELCOME",
        "IS",
        "STARTS_WITH",
        "ENDS_WITH",
        "CONTAINS_WORD",
        "CONTAINS",
        "STOP_PROMOTIONAL",
        "START_PROMOTIONAL",
        "START_AI_BOT",
        "STOP_AI_BOT",
    ]).optional(),

    isActive: z
        .string()
        .optional()
        .transform(v => {
            if (v === "true") return true;
            if (v === "false") return false;
            return undefined;
        }),
});

module.exports = { getAllBotsSchema };

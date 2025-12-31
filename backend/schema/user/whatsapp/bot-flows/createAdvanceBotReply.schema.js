const { z } = require("zod");

const buttonSchema = z.object({
    label: z.string().min(1),
    nextNodeKey: z.string().optional()
});

const listRowSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    nextNodeKey: z.string().optional()
});

const listSectionSchema = z.object({
    title: z.string().min(1),
    rows: z.array(listRowSchema).min(1)
});

const createInteractiveBotReplySchema = z.object({
    botId: z.number(),
    name: z.string().min(1),
    parentNodeKey: z.string(),

    bodyText: z.string().min(1),

    headerType: z.enum(["NONE", "TEXT", "IMAGE", "VIDEO", "DOCUMENT"]).optional(),
    headerText: z.string().optional(),
    headerMediaId: z.string().optional(),

    interactiveType: z.enum(["REPLY_BUTTON", "CTA_URL", "LIST"]),

    buttons: z.array(buttonSchema).optional(),

    ctaText: z.string().optional(),
    ctaUrl: z.string().url().optional(),

    listButtonText: z.string().optional(),
    listSections: z.array(listSectionSchema).optional(),

    footerText: z.string().optional()
});

module.exports = { createInteractiveBotReplySchema };

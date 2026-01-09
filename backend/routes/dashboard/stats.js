const RESPONSE_CODES = require("../../../config/responseCode");

const { PrismaClient } = require("../../../generated/prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const adminId = req.admin.id;

        // ==============================
        // TEMPLATES STATS
        // ==============================
        const [
            totalTemplates,
            approvedTemplates,
            pendingTemplates,
            rejectedTemplates
        ] = await Promise.all([
            prisma.template.count({ where: { isDeleted: false } }),
            prisma.template.count({ where: { status: "APPROVED", isDeleted: false } }),
            prisma.template.count({ where: { status: "SUBMITTED", isDeleted: false } }),
            prisma.template.count({ where: { status: "REJECTED", isDeleted: false } }),
        ]);

        // ==============================
        // CONTACTS STATS
        // ==============================
        const totalContacts = await prisma.contact.count({
            where: { isDeleted: false }
        });

        const totalGroups = await prisma.contactGroup.count({
            where: { isDeleted: false }
        });

        // ==============================
        // BOTS STATS
        // ==============================
        const activeBots = await prisma.bot.count({
            where: { isDeleted: false, isActive: true }
        });

        // ==============================
        // MESSAGE STATS
        // ==============================
        const [
            totalSent,
            totalDelivered,
            totalFailed
        ] = await Promise.all([
            prisma.messageLog.count({ where: { status: "SENT" } }),
            prisma.messageLog.count({ where: { status: "DELIVERED" } }),
            prisma.messageLog.count({ where: { status: "FAILED" } }),
        ]);

        // ==============================
        // CAMPAIGNS (Future use)
        // ==============================
        const totalCampaigns = 0; // abhi table nahi hai

        // ==============================
        // FINAL RESPONSE
        // ==============================
        res.status(RESPONSE_CODES.GET).json({
            status: 1,
            message: "Dashboard stats fetched successfully",
            statusCode: RESPONSE_CODES.GET,
            data: {
                templates: {
                    total: totalTemplates,
                    approved: approvedTemplates,
                    pending: pendingTemplates,
                    rejected: rejectedTemplates
                },
                contacts: {
                    total: totalContacts
                },
                groups: {
                    total: totalGroups
                },
                bots: {
                    active: activeBots
                },
                messages: {
                    sent: totalSent,
                    delivered: totalDelivered,
                    failed: totalFailed
                },
                campaigns: {
                    total: totalCampaigns
                }
            }
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(RESPONSE_CODES.ERROR).json({
            status: 0,
            message: "Internal server error",
            statusCode: RESPONSE_CODES.ERROR,
            data: {}
        });
    }
});

module.exports = router;
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../generated/prisma/client");
const prisma = new PrismaClient();

const RESPONSE_CODES = require("../../../config/responseCode");

router.post("/", async (req, res) => {
  try {
    const { campaignId } = req.body;
    const { accountId } = req.auth;

    // =========================
    // Validate Campaign
    // =========================
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        accountId,
        isDeleted: false,
      },
    });

    if (!campaign) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json({
        status: 0,
        message: "Campaign not found",
        statusCode: RESPONSE_CODES.NOT_FOUND,
        data: {},
      });
    }

    // =========================
    // Business Validation
    // =========================
    if (campaign.status !== "PAUSED") {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "Only paused campaign can be resumed",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    // =========================
    // Check Pending Audience
    // =========================
    const pendingCount = await prisma.campaignAudience.count({
      where: {
        campaignId,
        status: "PENDING",
      },
    });

    if (pendingCount === 0) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "No pending audience to resume",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    // =========================
    // Update Campaign Status
    // =========================
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "RUNNING",
        startedAt: campaign.startedAt || new Date(),
      },
    });

    // =========================
    // OPTIONAL: Immediate Trigger (basic loop)
    // =========================
    // ⚠️ only for small scale (no queue)
    setImmediate(async () => {
      try {
        const batchSize = campaign.batchSize || 50;

        while (true) {
          const latest = await prisma.campaign.findUnique({
            where: { id: campaignId },
          });

          if (!latest || latest.status !== "RUNNING") break;

          const audiences = await prisma.campaignAudience.findMany({
            where: {
              campaignId,
              status: "PENDING",
            },
            take: batchSize,
            include: {
              contact: true,
            },
          });

          if (!audiences.length) break;

          for (const a of audiences) {
            try {
              // 👉 Yahan WhatsApp send logic aayega
              console.log("Sending to:", a.contact.phone);

              await prisma.campaignAudience.update({
                where: { id: a.id },
                data: {
                  status: "SENT",
                  sentAt: new Date(),
                },
              });
            } catch (err) {
              await prisma.campaignAudience.update({
                where: { id: a.id },
                data: {
                  status: "FAILED",
                  errorMessage: err.message,
                  failedAt: new Date(),
                },
              });
            }
          }

          // delay
          await new Promise((r) =>
            setTimeout(r, campaign.delayInSeconds * 1000)
          );
        }

        // mark completed
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      } catch (err) {
        console.log("Background Resume Error:", err);
      }
    });

    return res.status(RESPONSE_CODES.POST).json({
      status: 1,
      message: "Campaign resumed successfully",
      statusCode: RESPONSE_CODES.POST,
      data: {
        pendingCount,
      },
    });
  } catch (error) {
    console.log("Resume Campaign Error:", error);

    return res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Something went wrong",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;
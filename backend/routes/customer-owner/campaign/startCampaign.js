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
    // Status Checks
    // =========================
    if (campaign.status === "RUNNING") {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "Campaign already running",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    if (campaign.status === "COMPLETED") {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "Campaign already completed",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    // =========================
    // Check Audience
    // =========================
    const audienceCount = await prisma.campaignAudience.count({
      where: { campaignId },
    });

    if (!audienceCount) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "No audience found for this campaign",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    // =========================
    // Batch Calculation
    // =========================
    const batchSize = campaign.batchSize || 50;

    const totalBatches = Math.ceil(audienceCount / batchSize);

    // =========================
    // Create Jobs (Batch-wise)
    // =========================
    const jobs = [];

    for (let i = 0; i < totalBatches; i++) {
      jobs.push({
        campaignId,
        batchNumber: i + 1,
        totalRecords: batchSize,
        status: "PENDING",
      });
    }

    await prisma.campaignJob.createMany({
      data: jobs,
    });

    // =========================
    // Update Campaign Status
    // =========================
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // =========================
    // Log Entry
    // =========================
    await prisma.campaignLog.create({
      data: {
        campaignId,
        type: "INFO",
        message: `Campaign started with ${audienceCount} contacts in ${totalBatches} batches`,
      },
    });

    res.status(RESPONSE_CODES.POST).json({
      status: 1,
      message: "Campaign started successfully",
      statusCode: RESPONSE_CODES.POST,
      data: {
        totalAudience: audienceCount,
        totalBatches,
      },
    });
  } catch (error) {
    console.log("Start Campaign Error:", error);

    res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Something went wrong",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../generated/prisma/client");
const prisma = new PrismaClient();

const RESPONSE_CODES = require("../../../config/responseCode");

router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      templateId,
      isScheduled,
      scheduledAt,
      batchSize,
      delayInSeconds,
    } = req.body;

    const { accountId, userId } = req.auth;

    // =========================
    // Validate Template
    // =========================
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        accountId,
        isDeleted: false,
        isActive: true,
        status: "APPROVED", // important
      },
    });

    if (!template) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json({
        status: 0,
        message: "Template not found or not approved",
        statusCode: RESPONSE_CODES.NOT_FOUND,
        data: {},
      });
    }

    // =========================
    // Validate Schedule
    // =========================
    let finalScheduledAt = null;

    if (isScheduled) {
      if (!scheduledAt) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          status: 0,
          message: "scheduledAt is required when scheduling campaign",
          statusCode: RESPONSE_CODES.BAD_REQUEST,
          data: {},
        });
      }

      const scheduleDate = new Date(scheduledAt);

      if (scheduleDate <= new Date()) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          status: 0,
          message: "Scheduled time must be in the future",
          statusCode: RESPONSE_CODES.BAD_REQUEST,
          data: {},
        });
      }

      finalScheduledAt = scheduleDate;
    }

    // =========================
    // Validate Limits (Safety)
    // =========================
    const safeBatchSize = Math.min(Math.max(batchSize || 50, 1), 100);
    const safeDelay = Math.min(Math.max(delayInSeconds || 2, 1), 60);

    // =========================
    // Prevent Duplicate Name (optional SaaS rule)
    // =========================
    const existing = await prisma.campaign.findFirst({
      where: {
        name,
        accountId,
        isDeleted: false,
      },
    });

    if (existing) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "Campaign with this name already exists",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    // =========================
    // Create Campaign
    // =========================
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        templateId,
        accountId,

        isScheduled: isScheduled || false,
        scheduledAt: finalScheduledAt,

        batchSize: safeBatchSize,
        delayInSeconds: safeDelay,

        createdByUserId: userId,
        status: isScheduled ? "SCHEDULED" : "DRAFT",
      },
    });

    // =========================
    // Log Entry
    // =========================
    await prisma.campaignLog.create({
      data: {
        campaignId: campaign.id,
        type: "INFO",
        message: "Campaign created",
      },
    });

    // =========================
    // Response (Safe)
    // =========================
    return res.status(RESPONSE_CODES.POST).json({
      status: 1,
      message: "Campaign created successfully",
      statusCode: RESPONSE_CODES.POST,
      data: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        isScheduled: campaign.isScheduled,
        scheduledAt: campaign.scheduledAt,
        createdAt: campaign.createdAt,
      },
    });
  } catch (error) {
    console.log("Create Campaign Error:", error);

    return res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Something went wrong",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../generated/prisma/client");
const prisma = new PrismaClient();

const RESPONSE_CODES = require("../../../config/responseCode");

router.get("/", async (req, res) => {
  try {
    const { id } = req.validatedParams;
    let { page, limit, search } = req.validatedQuery;

    const { accountId } = req.auth;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // =========================
    // Validate Campaign
    // =========================
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
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
    // Filters
    // =========================
    const where = {
      campaignId: id,
      campaign: { accountId },
    };

    if (search) {
      where.contact = {
        OR: [
          {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: search,
            },
          },
        ],
      };
    }

    // =========================
    // Fetch Data (WITH GROUPS)
    // =========================
    const [audiences, total] = await Promise.all([
      prisma.campaignAudience.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,

              // GROUPS INCLUDE
              contactGroupMap: {
                select: {
                  group: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.campaignAudience.count({ where }),
    ]);

    // =========================
    // Format Response
    // =========================
    const formatted = audiences.map((a) => ({
      id: a.id,
      contactId: a.contactId,

      name: `${a.contact?.firstName || ""} ${a.contact?.lastName || ""}`.trim(),

      phone: a.contact?.phone,

      // GROUPS
      groups:
        a.contact?.contactGroupMap?.map((g) => ({
          id: g.group.id,
          name: g.group.name,
        })) || [],

      status: a.status,

      sentAt: a.sentAt,
      deliveredAt: a.deliveredAt,
      readAt: a.readAt,
      failedAt: a.failedAt,

      errorMessage: a.errorMessage,
    }));

    // =========================
    // Response
    // =========================
    return res.status(RESPONSE_CODES.GET).json({
      status: 1,
      message: "Campaign audience fetched successfully",
      statusCode: RESPONSE_CODES.GET,
      data: {
        audience: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.log("Get Campaign Audience Error:", error);

    return res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Something went wrong",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;

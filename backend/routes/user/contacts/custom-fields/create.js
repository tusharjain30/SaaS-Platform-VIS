const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
};

router.post("/", async (req, res) => {
  try {
    const { accountId, userId } = req.auth;
    const { name, type } = req.body;

    const normalizedName = name.toLowerCase().trim();
    const key = slugify(normalizedName);

    if (!key) {
      return res.status(400).json({
        status: 0,
        message: "Invalid field name",
      });
    }

    // Limit check
    const count = await prisma.contactCustomField.count({
      where: { accountId, isDeleted: false },
    });

    if (count >= 50) {
      return res.status(400).json({
        status: 0,
        message: "Maximum 50 custom fields allowed",
      });
    }

    try {
      const field = await prisma.contactCustomField.create({
        data: {
          accountId,
          name,
          key,
          type,
          // optional:
          // createdByUserId: userId
        },
      });

      res.status(RESPONSE_CODES.POST).json({
        status: 1,
        message: "Custom field created successfully",
        statusCode: RESPONSE_CODES.POST,
        data: field,
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(400).json({
          status: 0,
          message: "Custom field already exists",
        });
      }
      throw err;
    }
  } catch (err) {
    console.error("Create custom field error:", err);
    res.status(500).json({
      status: 0,
      message: "Internal server error",
    });
  }
});

module.exports = router;

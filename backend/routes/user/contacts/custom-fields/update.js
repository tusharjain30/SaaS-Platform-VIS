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

router.put("/", async (req, res) => {
  try {
    const { accountId } = req.auth;
    const { fieldId, name, type } = req.body;

    const newKey = slugify(name);

    // Check field exists & belongs to user
    const field = await prisma.contactCustomField.findFirst({
      where: {
        id: fieldId,
        accountId,
        isDeleted: false,
      },
    });

    if (!field) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json({
        status: 0,
        message: "Custom field not found",
        statusCode: RESPONSE_CODES.NOT_FOUND,
        data: {},
      });
    }

    const exists = await prisma.contactCustomField.findFirst({
      where: {
        accountId,
        id: {
          not: fieldId,
        },
        key: newKey,
        isDeleted: false,
      },
    });

    if (exists) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "Custom field with this name already exists",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    // Update
    const updated = await prisma.contactCustomField.update({
      where: { id: fieldId },
      data: {
        name,
        key: newKey,
        type,
      },
    });

    res.status(RESPONSE_CODES.GET).json({
      status: 1,
      message: "Custom field updated successfully",
      statusCode: RESPONSE_CODES.GET,
      data: updated,
    });
  } catch (err) {
    console.error("Update Custom Field Error:", err);
    return res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Internal server error",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;

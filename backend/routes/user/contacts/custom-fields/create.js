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
    const key = slugify(name);

    const exists = await prisma.contactCustomField.findFirst({
      where: {
        accountId,
        key,
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

    /* -------- CREATE -------- */
    const field = await prisma.contactCustomField.create({
      data: {
        accountId,
        name,
        key,
        type,
      },
    });

    res.status(RESPONSE_CODES.POST).json({
      status: 1,
      message: "Custom field created successfully",
      statusCode: RESPONSE_CODES.POST,
      data: field,
    });
  } catch (err) {
    console.error("Create custom field error:", err);
    res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Internal server error",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;

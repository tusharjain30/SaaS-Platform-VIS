const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const { accountId } = req.auth;
    const params = req.validatedParams;
    const fieldId = Number(params.fieldId);

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

    res.status(RESPONSE_CODES.GET).json({
      status: 1,
      message: "Custom field detail fetched",
      statusCode: RESPONSE_CODES.GET,
      data: field,
    });
  } catch (err) {
    console.error("Custom Field Detail Error:", err);
    res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Internal server error",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;

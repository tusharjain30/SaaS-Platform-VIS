const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { accountId } = req.auth;
    const { groupId, contactIds } = req.body;

    /* ---------------- CHECK GROUP ---------------- */
    const group = await prisma.contactGroup.findFirst({
      where: {
        id: groupId,
        accountId,
        isDeleted: false,
      },
    });

    if (!group) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json({
        status: 0,
        message: "Group not found",
        statusCode: RESPONSE_CODES.NOT_FOUND,
        data: {},
      });
    }

    /* ---------------- DELETE MAPPING ---------------- */
    const result = await prisma.contactGroupMap.deleteMany({
      where: {
        groupId,
        contactId: { in: contactIds },
        contact: {
          accountId,
          isDeleted: false,
        },
      },
    });

    res.status(RESPONSE_CODES.GET).json({
      status: 1,
      message: "Contacts removed from group successfully",
      statusCode: RESPONSE_CODES.GET,
      data: {
        removedCount: result.count,
      },
    });
  } catch (error) {
    console.error("Remove contacts from group error:", error);
    res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Internal server error",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;

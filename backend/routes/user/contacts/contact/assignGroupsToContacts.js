const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { accountId } = req.auth;
    const { contactIds, groupIds } = req.body;

    /* ---------------- VERIFY CONTACTS ---------------- */
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        accountId,
        isDeleted: false,
      },
      select: { id: true },
    });

    if (contacts.length !== contactIds.length) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "Some contacts not found or do not belong to your account",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    /* ---------------- VERIFY GROUPS ---------------- */
    const groups = await prisma.contactGroup.findMany({
      where: {
        id: { in: groupIds },
        accountId,
        isDeleted: false,
      },
      select: { id: true },
    });

    if (groups.length !== groupIds.length) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "Some groups not found or do not belong to your account",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    /* ---------------- PREPARE BULK INSERT ---------------- */
    const rows = [];

    for (const cId of contactIds) {
      for (const gId of groupIds) {
        rows.push({
          contactId: cId,
          groupId: gId,
        });
      }
    }

    /* ---------------- BULK INSERT (SKIP DUPLICATES) ---------------- */
    await prisma.contactGroupMap.createMany({
      data: rows,
      skipDuplicates: true,
    });

    res.status(RESPONSE_CODES.GET).json({
      status: 1,
      message: "Groups assigned to selected contacts successfully",
      statusCode: RESPONSE_CODES.GET,
      data: {
        contactsCount: contactIds.length,
        groupsCount: groupIds.length,
        totalAssignmentsAttempted: rows.length,
      },
    });
  } catch (error) {
    console.error("Assign groups error:", error);
    res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Internal server error",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;

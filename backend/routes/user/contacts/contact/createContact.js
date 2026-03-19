const RESPONSE_CODES = require("../../../../config/responseCode");
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { userId, accountId } = req.auth;

    let {
      firstName,
      lastName,
      country,
      phone,
      languageCode,
      email,
      isOptedOut,
      groups,
      customFields,
    } = req.body;

    /* ================= VALIDATION ================= */
    if (!firstName || !phone) {
      return res.status(400).json({
        status: 0,
        message: "First name and phone are required",
      });
    }

    const normalizedPhone = phone.replace(/\D/g, "");

    /* ================= DUPLICATE CHECK ================= */
    const exists = await prisma.contact.findFirst({
      where: {
        accountId,
        phone: normalizedPhone,
        isDeleted: false,
      },
    });

    if (exists) {
      return res.status(RESPONSE_CODES.ALREADY_EXIST).json({
        status: 0,
        message: "Contact with this phone already exists",
        statusCode: RESPONSE_CODES.ALREADY_EXIST,
        data: {},
      });
    }

    /* ================= TRANSACTION ================= */
    const result = await prisma.$transaction(async (tx) => {
      /* CREATE CONTACT */
      const contact = await tx.contact.create({
        data: {
          accountId,
          createdByUserId: userId,
          firstName: firstName.trim(),
          lastName: lastName?.trim(),
          country: country?.trim(),
          phone: normalizedPhone,
          languageCode: languageCode?.trim(),
          email: email?.trim() || null,
          isOptedOut: isOptedOut ?? false,
        },
      });

      /* ================= GROUPS ================= */
      if (Array.isArray(groups) && groups.length) {
        const validGroups = await tx.contactGroup.findMany({
          where: {
            accountId,
            id: { in: groups },
            isDeleted: false,
          },
          select: { id: true },
        });

        const validIds = validGroups.map((g) => g.id);
        const invalid = groups.filter((id) => !validIds.includes(id));

        if (invalid.length) {
          throw new Error("INVALID_GROUP_IDS:" + invalid.join(","));
        }

        await tx.contactGroupMap.createMany({
          data: validIds.map((gid) => ({
            contactId: contact.id,
            groupId: gid,
            accountId,
          })),
          skipDuplicates: true,
        });
      }

      /* ================= CUSTOM FIELDS ================= */
      if (customFields && typeof customFields === "object") {
        const keys = Object.keys(customFields);

        if (keys.length) {
          const fields = await tx.contactCustomField.findMany({
            where: {
              accountId,
              key: { in: keys },
              isDeleted: false,
            },
          });

          const fieldMap = new Map(fields.map((f) => [f.key, f.id]));

          const invalidKeys = keys.filter((k) => !fieldMap.has(k));
          if (invalidKeys.length) {
            throw new Error("INVALID_CUSTOM_FIELDS:" + invalidKeys.join(","));
          }

          const dataToInsert = keys.map((key) => {
            const fieldId = fieldMap.get(key);

            return {
              contactId: contact.id,
              fieldId,
              accountId,
              value: customFields[key] != null ? String(customFields[key]) : "",
            };
          });

          if (dataToInsert.length) {
            await tx.contactCustomValue.createMany({
              data: dataToInsert,
              skipDuplicates: true,
            });
          }
        }
      }

      /* ================= FINAL RESPONSE ================= */
      return tx.contact.findUnique({
        where: { id: contact.id },
        include: {
          groups: { include: { group: true } },
          customValues: { include: { field: true } },
        },
      });
    });

    return res.status(201).json({
      status: 1,
      message: "Contact created successfully",
      data: result,
    });
  } catch (error) {
    /* ================= ERRORS ================= */

    if (error?.code === "P2002") {
      return res.status(409).json({
        status: 0,
        message: "Contact with this phone already exists",
      });
    }

    if (error.message?.startsWith("INVALID_GROUP_IDS:")) {
      return res.status(400).json({
        status: 0,
        message: "Some group IDs are invalid",
        data: {
          invalidGroupIds: error.message
            .replace("INVALID_GROUP_IDS:", "")
            .split(","),
        },
      });
    }

    if (error.message?.startsWith("INVALID_CUSTOM_FIELDS:")) {
      return res.status(400).json({
        status: 0,
        message: "Some custom field keys are invalid",
        data: {
          invalidKeys: error.message
            .replace("INVALID_CUSTOM_FIELDS:", "")
            .split(","),
        },
      });
    }

    console.error("Create contact error:", error);

    return res.status(500).json({
      status: 0,
      message: "Internal server error",
    });
  }
});

module.exports = router;

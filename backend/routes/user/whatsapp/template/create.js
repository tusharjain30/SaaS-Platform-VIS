const RESPONSE_CODES = require("../../../../config/responseCode");
const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();
const submitTemplateToMeta = require("../../../../services/Meta/submitTemplateToMeta.service");
const uploadMediaToMeta = require("../../../../services/Meta/uploadMediaToMeta");

const express = require("express");
const router = express.Router();

/* ---------------- VAR EXTRACTOR ---------------- */
const extractVariables = (body) => {
  const regex = /\{\{\s*(\d+)\s*\}\}/g;
  const vars = [];
  let match;

  while ((match = regex.exec(body)) !== null) {
    vars.push(`{{${match[1]}}}`);
  }
  return vars.length ? vars : null;
};

/* ---------------- ROUTE ---------------- */
router.post("/", async (req, res) => {
  try {
    const { userId, accessTokenId } = req.apiContext;

    let {
      name,
      category,
      language = "en_US",
      body,
      header,
      footer,
      buttons,
    } = req.body;

    /* -------- META NAME NORMALIZE -------- */
    const metaName = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    /* -------- CATEGORY RULE -------- */
    if (category === "AUTHENTICATION" && buttons?.length) {
      return res.status(400).json({
        status: 0,
        message: "Buttons not allowed in AUTHENTICATION templates",
      });
    }

    /* -------- DUPLICATE CHECK -------- */
    const exists = await prisma.template.findFirst({
      where: { userId, name: metaName, language, isDeleted: false },
    });

    if (exists) {
      return res.status(400).json({
        status: 0,
        message: "Template with this name already exists",
      });
    }

    /* -------- COMPONENT BUILD -------- */
    const components = [];
    const variables = extractVariables(body);

    /* -------- HEADER -------- */
    if (header) {
      if (["IMAGE", "VIDEO", "DOCUMENT"].includes(header.type)) {
        if (!req.file) {
          return res.status(400).json({
            status: 0,
            message: `${header.type} header requires file upload`,
          });
        }

        const mediaId = await uploadMediaToMeta({
          filePath: req.file.path,
          mimeType: req.file.mimetype,
          phoneNumberId: process.env.PHONE_NUMBER_ID,
          accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        });

        components.push({
          type: "HEADER",
          format: header.type,
          example: { header_handle: [mediaId] },
        });
      } else if (header.type === "TEXT") {
        const headerComp = {
          type: "HEADER",
          format: "TEXT",
          text: header.text,
        };

        if (header.text.includes("{{")) {
          headerComp.example = { header_text: ["Example"] };
        }

        components.push(headerComp);
      } else if (header.type === "LOCATION") {
        components.push({
          type: "HEADER",
          format: "LOCATION",
        });
      }
    }

    /* -------- BODY -------- */
    const bodyComp = { type: "BODY", text: body };

    if (variables?.length) {
      bodyComp.example = {
        body_text: [variables.map(() => "Example")],
      };
    }

    components.push(bodyComp);

    /* -------- FOOTER -------- */
    if (footer?.text) {
      components.push({
        type: "FOOTER",
        text: footer.text,
      });
    }

    /* -------- BUTTONS -------- */
    if (buttons?.length) {
      const metaButtons = buttons.map((btn) => {
        if (btn.type === "URL")
          return { type: "URL", text: btn.text, url: btn.url };
        if (btn.type === "QUICK_REPLY")
          return { type: "QUICK_REPLY", text: btn.text };
        if (btn.type === "CALL")
          return {
            type: "PHONE_NUMBER",
            text: btn.text,
            phone_number: btn.phoneNumber,
          };
      });

      components.push({ type: "BUTTONS", buttons: metaButtons });
    }

    /* -------- SUBMIT TO META -------- */
    let metaResponse;
    try {
      metaResponse = await submitTemplateToMeta(
        metaName,
        category,
        language,
        components
      );
    } catch (err) {
      return res.status(400).json({
        status: 0,
        message: "Meta template submission failed",
        error: err?.response?.data || err.message,
      });
    }

    /* -------- SAVE TO DB -------- */
    const template = await prisma.$transaction(async (tx) => {
      const created = await tx.template.create({
        data: {
          userId,
          name: metaName,
          category,
          language,
          body,
          variables,
          header,
          footer,
          buttons,
          components,
          status: "SUBMITTED",
          metaTemplateId: metaResponse.id,
        },
      });

      await tx.accessToken.update({
        where: { id: accessTokenId },
        data: { usedValue: { increment: 1 } },
      });

      return created;
    });

    res.status(RESPONSE_CODES.POST).json({
      status: 1,
      message: "Template submitted for Meta approval",
      data: template,
    });
  } catch (error) {
    console.log("Create Template Error:", error);
    res.status(500).json({
      status: 0,
      message: "Internal server error",
    });
  }
});

module.exports = router;

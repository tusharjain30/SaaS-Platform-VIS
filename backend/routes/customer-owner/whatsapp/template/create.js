const RESPONSE_CODES = require("../../../../config/responseCode");
const { PrismaClient } = require("../../../../generated/prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

const extractVariables = (text = "") => {
  const regex = /\{\{\s*(\d+)\s*\}\}/g;
  const variables = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    variables.push(`{{${match[1]}}}`);
  }

  return variables.length ? variables : null;
};

const buildTemplateComponents = ({ body, header, footer, buttons }) => {
  const components = [];
  const bodyVariables = extractVariables(body);

  if (header) {
    if (["IMAGE", "VIDEO", "DOCUMENT"].includes(header.type)) {
      const mediaHandle = header.mediaHandle || "MEDIA_HANDLE_PENDING";

      components.push({
        type: "HEADER",
        format: header.type,
        example: {
          header_handle: [mediaHandle],
        },
      });
    } else if (header.type === "TEXT") {
      const headerComponent = {
        type: "HEADER",
        format: "TEXT",
        text: header.text,
      };

      if (header.text?.includes("{{")) {
        headerComponent.example = { header_text: ["Example"] };
      }

      components.push(headerComponent);
    } else if (header.type === "LOCATION") {
      components.push({
        type: "HEADER",
        format: "LOCATION",
      });
    }
  }

  const bodyComponent = {
    type: "BODY",
    text: body,
  };

  if (bodyVariables?.length) {
    bodyComponent.example = {
      body_text: [bodyVariables.map(() => "Example")],
    };
  }

  components.push(bodyComponent);

  if (footer?.text) {
    components.push({
      type: "FOOTER",
      text: footer.text,
    });
  }

  if (Array.isArray(buttons) && buttons.length) {
    const mappedButtons = buttons
      .map((button) => {
        if (button.type === "URL") {
          return { type: "URL", text: button.text, url: button.url };
        }

        if (button.type === "QUICK_REPLY") {
          return { type: "QUICK_REPLY", text: button.text };
        }

        if (button.type === "CALL") {
          return {
            type: "PHONE_NUMBER",
            text: button.text,
            phone_number: button.phoneNumber,
          };
        }

        return null;
      })
      .filter(Boolean);

    if (mappedButtons.length) {
      components.push({
        type: "BUTTONS",
        buttons: mappedButtons,
      });
    }
  }

  return components;
};

router.post("/", async (req, res) => {
  try {
    const { accountId, userId } = req.auth;

    let {
      name,
      category,
      language = "en_US",
      body,
      header,
      footer,
      buttons,
    } = req.body;

    const metaName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

    if (category === "AUTHENTICATION" && buttons?.length) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "Buttons not allowed in AUTHENTICATION templates",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    const exists = await prisma.template.findFirst({
      where: {
        accountId,
        name: metaName,
        language,
        isDeleted: false,
      },
    });

    if (exists) {
      return res.status(RESPONSE_CODES.BAD_REQUEST).json({
        status: 0,
        message: "Template with this name already exists",
        statusCode: RESPONSE_CODES.BAD_REQUEST,
        data: {},
      });
    }

    let mediaFiles = null;

    if (header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(header.type)) {
      if (!req.file) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
          status: 0,
          message: `${header.type} header requires file upload`,
          statusCode: RESPONSE_CODES.BAD_REQUEST,
          data: {},
        });
      }

      const baseUrl = (process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, "");
      const uploadFolder = req.uploadFolder || "images";
      const fileName = req.uploadedFileName || req.file.filename;
      const publicUrl = `${baseUrl}/uploads/${uploadFolder}/${fileName}`;

      header = {
        ...header,
        localUrl: publicUrl,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
      };

      mediaFiles = [
        {
          type: header.type,
          url: publicUrl,
          localPath: req.file.path,
          folder: uploadFolder,
          fileName,
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
        },
      ];
    }

    const components = buildTemplateComponents({
      body,
      header,
      footer,
      buttons,
    });

    const template = await prisma.template.create({
      data: {
        accountId,
        createdByUserId: userId,
        name: metaName,
        category,
        language,
        body,
        header,
        footer,
        buttons,
        components,
        mediaFiles,
        status: "DRAFT",
        metaTemplateId: null,
        rejectReason: null,
        isActive: true,
        isDeleted: false,
      },
    });

    res.status(RESPONSE_CODES.POST).json({
      status: 1,
      message: "Template created and saved successfully",
      statusCode: RESPONSE_CODES.POST,
      data: template,
    });
  } catch (error) {
    console.log("Create Template Error:", error);
    res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Internal server error",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;


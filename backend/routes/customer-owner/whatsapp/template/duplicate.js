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
      components.push({
        type: "HEADER",
        format: header.type,
        example: {
          header_handle: [header.mediaHandle || "MEDIA_HANDLE_PENDING"],
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

const getDuplicateName = async ({ accountId, name, language }) => {
  const baseName = `${name}_copy`;
  let nextName = baseName;
  let counter = 2;

  while (
    await prisma.template.findFirst({
      where: {
        accountId,
        name: nextName,
        language,
        isDeleted: false,
      },
      select: { id: true },
    })
  ) {
    nextName = `${baseName}_${counter}`;
    counter += 1;
  }

  return nextName;
};

router.post("/", async (req, res) => {
  try {
    const { accountId, userId } = req.apiContext;
    const { templateId } = req.body;

    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        accountId,
        isDeleted: false,
      },
    });

    if (!template) {
      return res.status(RESPONSE_CODES.NOT_FOUND).json({
        status: 0,
        message: "Template not found",
        statusCode: RESPONSE_CODES.NOT_FOUND,
        data: {},
      });
    }

    const duplicateName = await getDuplicateName({
      accountId,
      name: template.name,
      language: template.language,
    });

    const nextHeader = template.header
      ? { ...template.header, mediaHandle: undefined }
      : null;

    const nextComponents = buildTemplateComponents({
      body: template.body,
      header: nextHeader,
      footer: template.footer,
      buttons: template.buttons,
    });

    const duplicatedTemplate = await prisma.template.create({
      data: {
        accountId,
        createdByUserId: userId,
        name: duplicateName,
        category: template.category,
        language: template.language,
        body: template.body,
        header: nextHeader,
        footer: template.footer,
        buttons: template.buttons,
        components: nextComponents,
        mediaFiles: template.mediaFiles,
        status: "DRAFT",
        metaTemplateId: null,
        rejectReason: null,
        isActive: true,
        isDeleted: false,
      },
    });

    return res.status(RESPONSE_CODES.POST).json({
      status: 1,
      message: "Template duplicated successfully",
      statusCode: RESPONSE_CODES.POST,
      data: duplicatedTemplate,
    });
  } catch (error) {
    console.log("Duplicate Template Error:", error);
    return res.status(RESPONSE_CODES.ERROR).json({
      status: 0,
      message: "Internal server error",
      statusCode: RESPONSE_CODES.ERROR,
      data: {},
    });
  }
});

module.exports = router;

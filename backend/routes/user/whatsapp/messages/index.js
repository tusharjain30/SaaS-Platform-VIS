const express = require("express");
const router = express.Router();

const validator = require("../../../../middleware/validator");
const requireAuth = require("../../../../middleware/requireAuth");
const upload = require("../../../../middleware/multerUpload");

const { sendTextMessageSchema } = require("../../../../schema/user/whatsapp/messages/sendTextMessage.schema");
const { sendMediaMessageSchema } = require("../../../../schema/user/whatsapp/messages/sendMediaMessage.schema");

const textMessageRoute = require("./text");
const sendMediaRoute = require("./sendMedia");

router.use("/send-text", requireAuth, validator(sendTextMessageSchema, "body"), textMessageRoute);
router.use("/send-media", requireAuth, upload.single("file"), validator(sendMediaMessageSchema, "body"), sendMediaRoute);

module.exports = router;
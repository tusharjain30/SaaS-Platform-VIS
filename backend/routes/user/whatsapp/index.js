const express = require("express");
const router = express.Router();

const VerifyWhatsappNumberRoutes = require("./VerifyWhatsappNumber");
const createApiRoutes = require("./create-api");
const templateRoutes = require("./template");
const webhookRoutes = require("./meta-webhooks");

router.use("/verify-whatsapp-number", VerifyWhatsappNumberRoutes);
router.use("/create", createApiRoutes);
router.use("/template", templateRoutes);
router.use("/meta", webhookRoutes);

module.exports = router;
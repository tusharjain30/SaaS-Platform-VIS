const express = require("express");
const router = express.Router();
const authRoutes = require("./auth/index");
const whatsappRoutes = require("./whatsapp");
const customerRoutes = require("./customer");
const contactRoutes = require("./contacts");

router.use("/auth", authRoutes);
router.use("/whatsapp", whatsappRoutes);
router.use("/customer", customerRoutes);
router.use("/contacts", contactRoutes);

module.exports = router;
const express = require("express");
const router = express.Router();
const authRoutes = require("./auth/index");
const whatsappRoutes = require("./whatsapp");
const customerRoutes = require("./customer");

router.use("/auth", authRoutes);
router.use("/whatsapp", whatsappRoutes);
router.use("/customer", customerRoutes);

module.exports = router;
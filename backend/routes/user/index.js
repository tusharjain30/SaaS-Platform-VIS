const express = require("express");
const router = express.Router();
const authRoutes = require("./auth/index");
const whatsappRoutes = require("./whatsapp");

router.use("/auth", authRoutes);
router.use("/whatsapp", whatsappRoutes);

module.exports = router;
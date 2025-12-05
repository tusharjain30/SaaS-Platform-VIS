const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const internalAdminRoutes = require("./internal-admin");

router.use("/auth", authRoutes);
router.use("/internal-admin", internalAdminRoutes);

module.exports = router;
const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const userRoutes = require("./user");
const permissionRoutes = require("./permission");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/permission", permissionRoutes);

module.exports = router;
const express = require("express");
const router = express.Router();

const contactRoutes = require("./contact");
const groupRoutes = require("./groups");

router.use("/contact", contactRoutes);
router.use("/groups", groupRoutes);

module.exports = router;
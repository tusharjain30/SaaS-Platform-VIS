const express = require("express");
const router = express.Router();
const adminAuth = require("../../../middleware/adminAuth");

const profileRoute = require("./read");

router.use("/get", adminAuth, profileRoute);

module.exports = router;

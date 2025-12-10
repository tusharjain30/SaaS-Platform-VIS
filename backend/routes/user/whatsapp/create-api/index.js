const express = require("express");
const router = express.Router();
const userAuth = require("../../../../middleware/userAuth");

const createApiRoute = require("./createApi");

router.use("/api", userAuth, createApiRoute);

module.exports = router;
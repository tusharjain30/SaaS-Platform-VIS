const express = require("express");
const router = express.Router();
const {adminCreateSchema} = require("../../../schema/admin/internal-admin/createAdmin.schema");
const validator = require("../../../middleware/validator");
const adminAuth = require("../../../middleware/adminAuth");

const createAdminRoute = require("./createAdmin");

router.use("/create-admin", adminAuth, validator(adminCreateSchema, "body"), createAdminRoute);

module.exports = router;
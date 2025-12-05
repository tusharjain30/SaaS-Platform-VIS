const express = require("express");
const router = express.Router();
const validator = require("../../../middleware/validator");

const registerRoute = require("./register");
const loginRoute = require("./login");
const logoutAllRoute = require("./logoutAllDevices");

const { superAdminRegisterSchema } = require("../../../schema/admin/auth/register.schema");
const { superAdminLoginSchema } = require("../../../schema/admin/auth/login.schema");

router.use("/register", validator(superAdminRegisterSchema, "body"), registerRoute);
router.use("/login", validator(superAdminLoginSchema, "body"), loginRoute);
router.use("/logout-all", logoutAllRoute);

module.exports = router;
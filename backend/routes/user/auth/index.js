const express = require("express");
const router = express.Router();

const validator = require("../../../middleware/validator");
const requireAuth = require("../../../middleware/requireAuth");

const { userRegisterSchema } = require("../../../schema/user/auth/register.schema");
const { userLoginSchema } = require("../../../schema/user/auth/login.schema");
const { verifyUserOtpSchema } = require("../../../schema/user/auth/verifyOtp.schema");
const { changePasswordSchema } = require("../../../schema/user/auth/changePassword.schema");

const registerRoute = require("./register");
const loginRoute = require("./login");
const verifyOtpRoute = require("./verifyOtp");
const changePasswordRoute = require("./changePassword");

router.use("/register", validator(userRegisterSchema, "body"), registerRoute);
router.use("/login", validator(userLoginSchema, "body"), loginRoute);
router.use("/changePassword", requireAuth, validator(changePasswordSchema, "body"), changePasswordRoute);
router.use("/verify-otp", validator(verifyUserOtpSchema, "body"), verifyOtpRoute);

module.exports = router;
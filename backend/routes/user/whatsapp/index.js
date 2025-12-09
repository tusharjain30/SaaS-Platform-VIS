const express = require("express");
const router = express.Router();

const userAuth = require("../../../middleware/userAuth");
const validator = require("../../../middleware/validator");
const { submitWhatsappNumberSchema } = require("../../../schema/user/whatsapp/submitNumber.schema");
const { verifyWhatsappOtpSchema } = require("../../../schema/user/whatsapp/verifyWhatsappOtp.schema");

const submitNumberRoute = require("./submitNumber");
const verifyWhatsappOtpRoute = require("./verifyWhatsappOtp");

router.use("/submit-number", userAuth, validator(submitWhatsappNumberSchema, "body"), submitNumberRoute);
router.use("/verify-otp", userAuth, validator(verifyWhatsappOtpSchema, "body"), verifyWhatsappOtpRoute);

module.exports = router;
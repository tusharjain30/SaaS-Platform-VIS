const express = require("express");
const router = express.Router();

const validator = require("../../../../middleware/validator");
const serviceAuth = require("../../../../middleware/serviceAuth");
// const userAuth = require("../../../../middleware/userAuth");

const {createTemplateSchema} = require("../../../../schema/user/whatsapp/template/createTemplate.schema");

const createTemplateRoute = require("./create");

router.use(
    "/create",
    serviceAuth("TEMPLATE"),
    validator(createTemplateSchema, "body"),
    createTemplateRoute
);

module.exports = router;
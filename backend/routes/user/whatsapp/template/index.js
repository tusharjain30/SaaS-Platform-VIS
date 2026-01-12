const express = require("express");
const router = express.Router();

const validator = require("../../../../middleware/validator");
const serviceAuth = require("../../../../middleware/serviceAuth");
// const requireAuth = require("../../../../middleware/requireAuth");
const parseJSONFields = require("../../../../middleware/parseJSONFields");
const upload = require("../../../../middleware/multerUpload");

const { createTemplateSchema } = require("../../../../schema/user/whatsapp/template/createTemplate.schema");
const { softDeleteTemplateSchema } = require("../../../../schema/user/whatsapp/template/delete.schema");

const createTemplateRoute = require("./create");
const listRoute = require("./read");
const deleteRoute = require("./delete");

router.use(
    "/create",
    serviceAuth("TEMPLATE"),
    upload.single("mediaFile"),
    parseJSONFields,
    validator(createTemplateSchema, "body"),
    createTemplateRoute
);

router.use("/list", serviceAuth("TEMPLATE"), listRoute);
router.use("/delete", serviceAuth("TEMPLATE"), validator(softDeleteTemplateSchema, "body"), deleteRoute);

module.exports = router;
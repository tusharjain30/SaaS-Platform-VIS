const express = require("express");
const router = express.Router();

const validator = require("../../../../middleware/validator");
const serviceAuth = require("../../../../middleware/serviceAuth");
const parseJSONFields = require("../../../../middleware/parseJSONFields");
const upload = require("../../../../middleware/multerUpload");

const {
  createTemplateSchema,
} = require("../../../../schema/customer-owner/whatsapp/template/createTemplate.schema");
const {
  updateTemplateSchema,
} = require("../../../../schema/customer-owner/whatsapp/template/update.schema");
const {
  softDeleteTemplateSchema,
} = require("../../../../schema/customer-owner/whatsapp/template/delete.schema");
const {
  submitTemplateSchema,
} = require("../../../../schema/customer-owner/whatsapp/template/submit.schema");
const {
  templateDetailSchema,
} = require("../../../../schema/customer-owner/whatsapp/template/detail.schema");
const {
  duplicateTemplateSchema,
} = require("../../../../schema/customer-owner/whatsapp/template/duplicate.schema");

const createTemplateRoute = require("./create");
const updateTemplateRoute = require("./update");
const submitTemplateRoute = require("./submit");
const duplicateTemplateRoute = require("./duplicate");
const listRoute = require("./read");
const detailRoute = require("./detail");
const deleteRoute = require("./delete");

router.use(
  "/create",
  serviceAuth("TEMPLATE"),
  upload.single("file"),
  parseJSONFields,
  validator(createTemplateSchema, "body"),
  createTemplateRoute,
);

router.use(
  "/update",
  serviceAuth("TEMPLATE"),
  upload.single("file"),
  parseJSONFields,
  validator(updateTemplateSchema, "body"),
  updateTemplateRoute,
);

router.use(
  "/submit",
  serviceAuth("TEMPLATE"),
  validator(submitTemplateSchema, "body"),
  submitTemplateRoute,
);

router.use(
  "/duplicate",
  serviceAuth("TEMPLATE"),
  validator(duplicateTemplateSchema, "body"),
  duplicateTemplateRoute,
);

router.use("/list", serviceAuth("TEMPLATE"), listRoute);

router.use(
  "/detail/:templateId",
  serviceAuth("TEMPLATE"),
  validator(templateDetailSchema, "params"),
  detailRoute,
);

router.use(
  "/delete",
  serviceAuth("TEMPLATE"),
  validator(softDeleteTemplateSchema, "body"),
  deleteRoute,
);

module.exports = router;


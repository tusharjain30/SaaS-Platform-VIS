const express = require("express");
const router = express.Router();

const requireAuth = require("../../../../middleware/requireAuth");
const validator = require("../../../../middleware/validator");

const { createCustomFieldSchema } = require("../../../../schema/user/contacts/custom-fields/create.schema");
const { updateCustomFieldSchema } = require("../../../../schema/user/contacts/custom-fields/update.schema");
const { customFieldDetailSchema } = require("../../../../schema/user/contacts/custom-fields/detail.schema");
const { listCustomFieldsSchema } = require("../../../../schema/user/contacts/custom-fields/list.schema");
const { deleteCustomFieldSchema } = require("../../../../schema/user/contacts/custom-fields/delete.schema");

const createRoute = require("./create");
const updateRoute = require("./update");
const detailRoute = require("./detail");
const listRoute = require("./list");
const deleteRoute = require("./delete");

router.use("/create", requireAuth, validator(createCustomFieldSchema, "body"), createRoute);
router.use("/update", requireAuth, validator(updateCustomFieldSchema, "body"), updateRoute);
router.use("/detail", requireAuth, validator(customFieldDetailSchema, "body"), detailRoute);
router.use("/list", requireAuth, validator(listCustomFieldsSchema, "query"), listRoute);
router.use("/delete", requireAuth, validator(deleteCustomFieldSchema, "body"), deleteRoute);

module.exports = router;
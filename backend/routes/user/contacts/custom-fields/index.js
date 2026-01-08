const express = require("express");
const router = express.Router();

const userAuth = require("../../../../middleware/userAuth");
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

router.use("/create", userAuth, validator(createCustomFieldSchema, "body"), createRoute);
router.use("/update", userAuth, validator(updateCustomFieldSchema, "body"), updateRoute);
router.use("/detail", userAuth, validator(customFieldDetailSchema, "body"), detailRoute);
router.use("/list", userAuth, validator(listCustomFieldsSchema, "query"), listRoute);
router.use("/delete", userAuth, validator(deleteCustomFieldSchema, "body"), deleteRoute);

module.exports = router;
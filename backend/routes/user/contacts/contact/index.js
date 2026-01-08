const express = require("express");
const router = express.Router();

const userAuth = require("../../../../middleware/userAuth");
const validator = require("../../../../middleware/validator");

const { createContactSchema } = require("../../../../schema/user/contacts/contact/createContact.schema");
const { updateContactSchema } = require("../../../../schema/user/contacts/contact/updateContact.schema");
const { assignGroupsToContactsSchema } = require("../../../../schema/user/contacts/contact/assignGroupsToContacts.schema");
const { deleteContactSchema } = require("../../../../schema/user/contacts/contact/delete.schema");
const { bulkDeleteContactsSchema } = require("../../../../schema/user/contacts/contact/bulkDelete.schema");
const { detailContactSchema } = require("../../../../schema/user/contacts/contact/detail.schema");

const createContactRoute = require("./createContact");
const updateContactRoute = require("./updateContact");
const contactDetailsRoute = require("./detail");
const readContactsRoute = require("./read");
const deleteContactsRoute = require("./delete");
const bulkDeleteRoute = require("./bulkDelete");
const importContactsRoute = require("./importContacts");
const assignGroupsToContactsRoute = require("./assignGroupsToContacts");

router.use("/create", userAuth, validator(createContactSchema, "body"), createContactRoute);
router.use("/update", userAuth, validator(updateContactSchema, "body"), updateContactRoute);
router.use("/detail", validator(detailContactSchema, "body"), userAuth, contactDetailsRoute);
router.use("/read", userAuth, readContactsRoute);
router.use("/delete", validator(deleteContactSchema, "body"), userAuth, deleteContactsRoute);
router.use("/bulk-delete", validator(bulkDeleteContactsSchema, "body"), userAuth, bulkDeleteRoute);
router.use("/import", userAuth, importContactsRoute);
router.use("/assign-groups", userAuth, validator(assignGroupsToContactsSchema, "body"), assignGroupsToContactsRoute);

module.exports = router;
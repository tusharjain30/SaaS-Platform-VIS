const express = require("express");
const router = express.Router();

const requireAuth = require("../../../../middleware/requireAuth");
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

router.use("/create", requireAuth, validator(createContactSchema, "body"), createContactRoute);
router.use("/update", requireAuth, validator(updateContactSchema, "body"), updateContactRoute);
router.use("/detail", validator(detailContactSchema, "body"), requireAuth, contactDetailsRoute);
router.use("/read", requireAuth, readContactsRoute);
router.use("/delete", validator(deleteContactSchema, "body"), requireAuth, deleteContactsRoute);
router.use("/bulk-delete", validator(bulkDeleteContactsSchema, "body"), requireAuth, bulkDeleteRoute);
router.use("/import", requireAuth, importContactsRoute);
router.use("/assign-groups", requireAuth, validator(assignGroupsToContactsSchema, "body"), assignGroupsToContactsRoute);

module.exports = router;
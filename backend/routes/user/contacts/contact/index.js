const express = require("express");
const router = express.Router();

const userAuth = require("../../../../middleware/userAuth");
const validator = require("../../../../middleware/validator");

const { createContactSchema } = require("../../../../schema/user/contacts/contact/createContact.schema");
const { updateContactSchema } = require("../../../../schema/user/contacts/contact/updateContact.schema");

const createContactRoute = require("./createContact");
const updateContactRoute = require("./updateContact");
const contactDetailsRoute = require("./detail");
const readContactsRoute = require("./read");
const deleteContactsRoute = require("./delete");
const assignGroupFromContactRoute = require("./assignGroup");
const removeGroupFromContactRoute = require("./removeGroup");
const bulkDeleteRoute = require("./bulkDelete");
const assignGroupToContactsRoute = require("./assignGroupToContacts");
const importContactsRoute = require("./importContacts");

router.use("/create", userAuth, validator(createContactSchema, "body"), createContactRoute);
router.use("/update", userAuth, validator(updateContactSchema, "body"), updateContactRoute);
router.use("/detail", userAuth, contactDetailsRoute);
router.use("/read", userAuth, readContactsRoute);
router.use("/delete", userAuth, deleteContactsRoute);
router.use("/assign", userAuth, assignGroupFromContactRoute);
router.use("/remove", userAuth, removeGroupFromContactRoute);
router.use("/bulk-delete", userAuth, bulkDeleteRoute);
router.use("/assignGroupToContacts", userAuth, assignGroupToContactsRoute);
router.use("/import", userAuth, importContactsRoute);

module.exports = router;
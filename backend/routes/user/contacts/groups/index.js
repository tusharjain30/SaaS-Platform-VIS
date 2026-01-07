const express = require("express");
const router = express.Router();

const userAuth = require("../../../../middleware/userAuth");
const validator = require("../../../../middleware/validator");

const { createContactGroupSchema } = require("../../../../schema/user/contacts/groups/createGroup.schema");
const { updateGroupSchema } = require("../../../../schema/user/contacts/groups/updateGroup.schema");
const { detailGroupSchema } = require("../../../../schema/user/contacts/groups/detail.schema");
const { toggleArchiveGroupSchema } = require("../../../../schema/user/contacts/groups/toggleArchiveGroup.schema");
const { toggleArchiveBulkSchema } = require("../../../../schema/user/contacts/groups/toggleArchiveBulk.schema");
const { deleteGroupSchema } = require("../../../../schema/user/contacts/groups/delete.schema");
const { bulkDeleteGroupSchema } = require("../../../../schema/user/contacts/groups/bulkDelete.schema");
const { readGroupsBodySchema } = require("../../../../schema/user/contacts/groups/read.schema");
const { removeContactsFromGroupSchema } = require("../../../../schema/user/contacts/groups/removeContactsFromGroup.schema");
const { getGroupContactsSchema } = require("../../../../schema/user/contacts/groups/getGroupContacts.schema");

const createGroupRoute = require("./create");
const updateGroupRoute = require("./update");
const groupDetailsRoute = require("./details");
const toggleArchiveGroupRoute = require("./toggleArchiveGroup");
const toggleArchiveBulkRoute = require("./toggleArchiveBulk");
const deleteRoute = require("./delete");
const bulkDeleteRoute = require("./bulkDelete");
const readRoute = require("./read");
const removeContactsFromGroupRoute = require("./removeContactsFromGroup");
const getGroupContactsRoute = require("./getGroupContacts");

router.use("/create", userAuth, validator(createContactGroupSchema, "body"), createGroupRoute);
router.use("/update", userAuth, validator(updateGroupSchema, "body"), updateGroupRoute);
router.use("/detail", userAuth, validator(detailGroupSchema, "body"), groupDetailsRoute);
router.use("/toggle-archive", userAuth, validator(toggleArchiveGroupSchema, "body"), toggleArchiveGroupRoute);
router.use("/toggle-archive-bulk", userAuth, validator(toggleArchiveBulkSchema, "body"), toggleArchiveBulkRoute);
router.use("/delete", userAuth, validator(deleteGroupSchema, "body"), deleteRoute);
router.use("/bulk-delete", userAuth, validator(bulkDeleteGroupSchema, "body"), bulkDeleteRoute);
router.use("/read", userAuth, validator(readGroupsBodySchema, "body"), readRoute);
router.use("/remove-contacts", userAuth, validator(removeContactsFromGroupSchema, "body"), removeContactsFromGroupRoute);
router.use("/contacts", userAuth, validator(getGroupContactsSchema, "body"), getGroupContactsRoute);

module.exports = router;
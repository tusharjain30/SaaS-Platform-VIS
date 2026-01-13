const express = require("express");
const router = express.Router();

const requireAuth = require("../../../../middleware/requireAuth");
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
const { getGroupContactsParamsSchema, getGroupContactsQuerySchema } = require("../../../../schema/user/contacts/groups/getGroupContacts.schema");

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

router.use("/create", requireAuth, validator(createContactGroupSchema, "body"), createGroupRoute);
router.use("/update", requireAuth, validator(updateGroupSchema, "body"), updateGroupRoute);
router.use("/detail/:groupId", requireAuth, validator(detailGroupSchema, "params"), groupDetailsRoute);
router.use("/toggle-archive", requireAuth, validator(toggleArchiveGroupSchema, "body"), toggleArchiveGroupRoute);
router.use("/toggle-archive-bulk", requireAuth, validator(toggleArchiveBulkSchema, "body"), toggleArchiveBulkRoute);
router.use("/delete/:groupId", requireAuth, validator(deleteGroupSchema, "params"), deleteRoute);
router.use("/bulk-delete", requireAuth, validator(bulkDeleteGroupSchema, "body"), bulkDeleteRoute);
router.use("/read", requireAuth, validator(readGroupsBodySchema, "query"), readRoute);
router.use("/remove-contacts", requireAuth, validator(removeContactsFromGroupSchema, "body"), removeContactsFromGroupRoute);
router.use("/contacts/:groupId", requireAuth, validator(getGroupContactsParamsSchema, "params"), validator(getGroupContactsQuerySchema, "query"), getGroupContactsRoute);

module.exports = router;
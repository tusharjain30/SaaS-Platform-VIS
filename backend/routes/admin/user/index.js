const express = require("express");
const router = express.Router();
const { adminCreateSchema } = require("../../../schema/admin/user/create.schema");
const { adminListQuerySchema } = require("../../../schema/admin/user/read.schema");
const { updateAdminSchema } = require("../../../schema/admin/user/update.schema");
const { softDeleteAdminSchema } = require("../../../schema/admin/user/delete.schema");
const { detailAdminSchema } = require("../../../schema/admin/user/detail.schema");


const validator = require("../../../middleware/validator");
const adminAuth = require("../../../middleware/adminAuth");

const createAdminRoute = require("./createAdmin");
const adminlistRoute = require("./read");
const adminUpdateRoute = require("./update");
const adminDeleteRoute = require("./delete");
const adminDetailRoute = require("./detail");

router.use("/create-admin", adminAuth, validator(adminCreateSchema, "body"), createAdminRoute);
router.use("/read", adminAuth, validator(adminListQuerySchema, "query"), adminlistRoute);
router.use("/update", adminAuth, validator(updateAdminSchema, "body"), adminUpdateRoute);
router.use("/delete", adminAuth, validator(softDeleteAdminSchema, "body"), adminDeleteRoute);
router.use("/:adminId", adminAuth, validator(detailAdminSchema, "params"), adminDetailRoute);

module.exports = router;
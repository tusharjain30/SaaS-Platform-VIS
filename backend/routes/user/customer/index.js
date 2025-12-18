const express = require("express");
const router = express.Router();

const adminAuth = require("../../../middleware/adminAuth");
const userAuth = require("../../../middleware/userAuth");
const checkPermission = require("../../../middleware/checkPermission");
const validator = require("../../../middleware/validator");

const { getCustomersQuerySchema } = require("../../../schema/user/customer/list.schema");
const { getCustomerByIdSchema } = require("../../../schema/user/customer/getCustomerById.schema");
const { updateCustomerBodySchema } = require("../../../schema/user/customer/update.schema");
const { customerStatusBodySchema } = require("../../../schema/user/customer/status.schema");
const { customerVerificationBodySchema } = require("../../../schema/user/customer/verify.schema");
const { deleteCustomerBodySchema } = require("../../../schema/user/customer/delete.schema");
const { customerForceLogoutSchema } = require("../../../schema/user/customer/forceLogout.schema");

const getCustomerListRoute = require("./list");
const getCustomerByIdRoute = require("./getCustomerById");
const updateRoute = require("./update");
const statusRoute = require("./status");
const verifyRoute = require("./verify");
const deleteRoute = require("./delete");
const statsRoute = require("./stats");
const forceLogoutRoute = require("./forceLogout");
const profileRoute = require("./profile");

router.use("/list", adminAuth, checkPermission("VIEW_CUSTOMERS"), validator(getCustomersQuerySchema, "query"), getCustomerListRoute);
router.use("/detail", adminAuth, checkPermission("VIEW_CUSTOMER"), validator(getCustomerByIdSchema, "body"), getCustomerByIdRoute);
router.use("/update", adminAuth, checkPermission("UPDATE_CUSTOMER"), validator(updateCustomerBodySchema, "body"), updateRoute);
router.use("/status", adminAuth, checkPermission("UPDATE_CUSTOMER_STATUS"), validator(customerStatusBodySchema, "body"), statusRoute);
router.use("/verify", adminAuth, checkPermission("VERIFY_CUSTOMER"), validator(customerVerificationBodySchema, "body"), verifyRoute);
router.use("/delete", adminAuth, checkPermission("DELETE_CUSTOMER"), validator(deleteCustomerBodySchema, "body"), deleteRoute);
router.use("/stats", adminAuth, checkPermission("VIEW_CUSTOMER_STATS"), statsRoute);
router.use("/force-logout", adminAuth, checkPermission("FORCE_LOGOUT_CUSTOMER"), validator(customerForceLogoutSchema, "body"), forceLogoutRoute);
router.use("/me", userAuth, profileRoute);

module.exports = router;
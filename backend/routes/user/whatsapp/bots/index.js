const express = require("express");
const router = express.Router();

const validator = require("../../../../middleware/validator");
const userAuth = require("../../../../middleware/userAuth");

const { createSimpleBotSchema } = require("../../../../schema/user/whatsapp/bots/create.schema");
const { getAllBotsSchema } = require("../../../../schema/user/whatsapp/bots/list.schema");
const { getBotByIdSchema } = require("../../../../schema/user/whatsapp/bots/detail.schema");
const { deleteBotSchema } = require("../../../../schema/user/whatsapp/bots/delete.schema");
const { statusBotSchema } = require("../../../../schema/user/whatsapp/bots/status.schema");

const createBotRoute = require("./create");
const listRoute = require("./list");
const detailRoute = require("./detail");
const deleteRoute = require("./delete");
const statusRoute = require("./status");

router.use("/create", userAuth, validator(createSimpleBotSchema, "body"), createBotRoute);
router.use("/list", userAuth, validator(getAllBotsSchema, "query"), listRoute);
router.use("/detail", userAuth, validator(getBotByIdSchema, "body"), detailRoute);
router.use("/delete", userAuth, validator(deleteBotSchema, "body"), deleteRoute);
router.use("/status", userAuth, validator(statusBotSchema, "body"), statusRoute);

module.exports = router;
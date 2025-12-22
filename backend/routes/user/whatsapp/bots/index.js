const express = require("express");
const router = express.Router();

const validator = require("../../../../middleware/validator");
// const userAuth = require("../../../../middleware/userAuth");
const serviceAuth = require("../../../../middleware/serviceAuth");
const upload = require("../../../../middleware/multerUpload");

const { createSimpleBotSchema } = require("../../../../schema/user/whatsapp/bots/createSimple.schema");
const { getAllBotsSchema } = require("../../../../schema/user/whatsapp/bots/list.schema");
const { getBotByIdSchema } = require("../../../../schema/user/whatsapp/bots/detail.schema");
const { deleteBotSchema } = require("../../../../schema/user/whatsapp/bots/delete.schema");
const { statusBotSchema } = require("../../../../schema/user/whatsapp/bots/status.schema");
const { createMediaBotSchema } = require("../../../../schema/user/whatsapp/bots/createMedia.schema");
const { createAdvanceBotSchema } = require("../../../../schema/user/whatsapp/bots/createInteractive.schema");

const createSimpleBotRoute = require("./createSimple");
const createMediaBotRoute = require("./createMedia");
const createInteractiveBotRoute = require("./createInteractive");
const listRoute = require("./list");
const detailRoute = require("./detail");
const deleteRoute = require("./delete");
const statusRoute = require("./status");
const parseJSONFields = require("../../../../middleware/parseJSONFields");

router.use("/createSimpleBot", serviceAuth("BOT"), validator(createSimpleBotSchema, "body"), createSimpleBotRoute);
router.use("/createMediaBot", serviceAuth("BOT"), upload.single("mediaFile"), validator(createMediaBotSchema, "body"), createMediaBotRoute);
router.use("/createInteractiveBot", serviceAuth("BOT"), upload.single("mediaFile"), parseJSONFields, validator(createAdvanceBotSchema, "body"), createInteractiveBotRoute);
router.use("/list", serviceAuth("BOT"), validator(getAllBotsSchema, "query"), listRoute);
router.use("/detail", serviceAuth("BOT"), validator(getBotByIdSchema, "body"), detailRoute);
router.use("/delete", serviceAuth("BOT"), validator(deleteBotSchema, "body"), deleteRoute);
router.use("/status", serviceAuth("BOT"), validator(statusBotSchema, "body"), statusRoute);

module.exports = router;
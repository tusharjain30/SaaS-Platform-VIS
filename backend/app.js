const express = require("express");
const app = express();
require("dotenv").config();

const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin/index");
const userRouter = require("./routes/user/index");

app.use(express.json());

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
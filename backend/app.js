const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();

const indexRouter = require("./routes");
const adminRouter = require("./routes/super-admin");
const userRouter = require("./routes/user");
const dashboardRouter = require("./routes/dashboard");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", indexRouter);
app.use("/super-admin", adminRouter);
app.use("/user", userRouter);
app.use("/dashboard", dashboardRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
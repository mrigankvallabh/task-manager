const express = require("express");
const port = process.env.PORT || 3000;
require("./db/mongoose");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => console.log(`Listening intently on port ${port}`));

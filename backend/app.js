const express = require("express");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const serversRoute = require("./routes/servers");

app.use("/api", serversRoute);

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});

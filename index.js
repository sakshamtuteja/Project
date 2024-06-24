const express = require("express");
require("dotenv").config();
const { handler } = require("./controllers");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("*", (req, res) => {
  console.log(req.query);
  res.send("Hello Undercover TelBot!");
});

app.post("*", async (req, res) => {
  res.send((await handler(req, res)) || "ok");
});

app.use((err, _, res) => {
  console.error(err);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
});

/**
 * telegram webhook
 * https://api.telegram.org/bot<token>/setWebhook?url=<url>
 */

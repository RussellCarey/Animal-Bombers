const path = require("path");
const dotenv = require("dotenv");
const randomWords = require("random-words");
const express = require("express");
const app = express();
const server = require("http").Server(app);

const port = 4100;

const SocketController = require("./controllers/SocketController");

// App setup
dotenv.config();
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "pug");

app.get("", async (req, res) => {
  res.render("index");
});

server.listen(port, () => console.log(`Server has loaded on ${port}`));

SocketController.setupSocketCommands(server);

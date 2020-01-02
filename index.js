#!/usr/bin/env node

process.on("SIGINT", function() {
  process.exit();
});
process.on("uncaughtException", function(err) {
  console.error(err);
});
process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

let proxyPort = 8002;
let httpsPort = 8003;

const httpServer = require('./http.js');
const httpsServer = require("./https.js");

new httpServer(proxyPort, httpsPort).start();
new httpsServer(httpsPort).start();

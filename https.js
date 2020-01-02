const https = require("https");
const fs = require("fs");
const ReqHandle = require("./req-handle.js");

/**
 * 1、转发https请求
 * 2、转发wss请求
 */
module.exports = class HttpsServer {
  constructor(httpsPort) {
    this.httpsPort = httpsPort;
    this.reqHandle = new ReqHandle();
  }

  async start() {
    this.httpsProxyServer = https.createServer({
      key: fs.readFileSync("./ca.key"),
      cert: fs.readFileSync("./ca.crt")
    });

    let that = this;

    this.httpsProxyServer.on("request", (req, res) => {
      console.log("https: ", req.url);
      that.reqHandle.handle(req, res).catch(e => {
        console.error(e);
      });
    });

    this.httpsProxyServer.on("error", function(err) {
      console.log(err);
      process.exit(0);
    });

    this.httpsProxyServer.listen(this.httpsPort, "0.0.0.0");
  }
};

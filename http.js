const http = require("http");
const connectHandle = require("./connect.js");
const ReqHandle = require("./req-handle.js");

/**
 * 1、接受浏览器发出的connect请求（ws、wss、https）
 * 2、转发http请求
 * 3、转发ws请求
 */
module.exports = class HttpServer {
  constructor(httpPort, httpsPort) {
    this.httpPort = httpPort;
    this.httpsPort = httpsPort;
    this.connectHandle = new connectHandle(this.httpPort, this.httpsPort);
    this.reqHandle = new ReqHandle();
  }

  start() {
    this.httpProxyServer = http.createServer();

    let that = this;

    this.httpProxyServer.on("request", (req, res) => {
      console.log("http: ", req.url);
      that.reqHandle.handle(req, res).catch(e => {
        console.error(e);
      });
    });

    this.httpProxyServer.on("connect", (req, res) => {
      that.connectHandle.handle(req, res).catch(e => {
        console.error(e);
      });
    });

    this.httpProxyServer.on("error", function(err) {
      console.log(err);
      process.exit(0);
    });

    this.httpProxyServer.listen(this.httpPort, "0.0.0.0");
  }
};

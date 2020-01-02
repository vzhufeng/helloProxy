const net = require("net");

module.exports = class ConnectHandle {
  constructor(httpProxyPort, httpsProxyPort) {
    this.httpProxyPort = httpProxyPort;
    this.httpsProxyPort = httpsProxyPort;
    // 此字段记录proxy请求内部https server链接和client的ip之间的映射关系
    // 方便https server处理请求时，能够找出对应的client ip
    this.connPortIpMap = {};
  }

  async handle(req, socket, head) {
    let proxyHost = "127.0.0.1";
    let proxyPort;

    let [targetHost, targetPort] = req.url.split(":");
    if (targetPort == 443) {
      proxyPort = this.httpsProxyPort;
    } else {
      // 非443的连接让http服务器处理
      // ws协议直接和远程服务器链接
      proxyHost = targetHost;
      proxyPort = targetPort;
    }

    let requestPort;
    let conn = net.connect(proxyPort, proxyHost, () => {
      // 记录发出请求端口和远程ip的映射关系
      let { port } = conn.address();
      requestPort = port;
      this.connPortIpMap[port] = socket.remoteAddress;
      // console.log(port + " --> " + socket.remoteAddress);
      socket.write(
        "HTTP/" + req.httpVersion + " 200 OK\r\n\r\n",
        "UTF-8",
        function() {
          conn.pipe(socket);
          socket.pipe(conn);
        }
      );
    });

    conn.on("error", e => {
      // console.error("error when connect to " + proxyHost + ":" + proxyPort);
      console.error(e);
      delete this.connPortIpMap[requestPort];
    });

    conn.on("close", e => {
      // console.error("connect " + proxyHost + ":" + proxyPort + " closed");
      delete this.connPortIpMap[requestPort];
    });
  }
};

const https = require("https");
const axios = require("axios");

const Koa = require("koa");
const body = require("koa-body");

const app = new Koa();
app.use(body());

let instance;

app.use(async function(ctx, next) {
  const contentType = ctx.headers["content-type"];
  const isJson =
    contentType &&
    (contentType.indexOf("json") > -1 ||
      contentType.indexOf("application/csp-report") > -1);

  let axiosRes = await axios({
    method: ctx.method,
    baseURL: ctx.origin,
    url: ctx.url,
    headers: ctx.headers,
    data: isJson ? ctx.request.body : ctx.req,
    responseType: "stream",
    validateStatus: function(status) {
      return true; // default
    },
    maxRedirects: 10,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });
  ctx.status = axiosRes.status;
  let header = JSON.parse(JSON.stringify(axiosRes.headers));
  delete header["content-length"];
  ctx.set(header);

  // if(ctx.url === 'https://dss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/js/min_super_466059f0.js'){
  //   ctx.body = '123'
  // }else{
  //   ctx.body = axiosRes.data;
  // }

  ctx.body = axiosRes.data;
});

module.exports = class RepHandle {
  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }

  async handle(req, res) {
    app.callback()(req, res);
  }
};

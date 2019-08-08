const Koa = require('koa');
const logger = require('koa-logger');
const Router = require('koa-router');
var bodyParser = require('koa-bodyparser');

const app = new Koa();

// log all events to the terminal
app.use(logger());
app.use(bodyParser());

// error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

// instantiate our new Router
const routerV1Beneficiary = new Router({ prefix: '/api/v1/beneficiary/transaction' });
const routerV1Originator = new Router( {prefix: '/api/v1/originator/transaction'} );

// require our external routes and pass in the router
require('./routes/v1/beneficiary')({ routerV1Beneficiary });
require('./routes/v1/originator')({ routerV1Originator });

// tells the router to use all the routes that are on the object
app.use(routerV1Beneficiary.routes());
app.use(routerV1Beneficiary.allowedMethods());

app.use(routerV1Originator.routes());
app.use(routerV1Originator.allowedMethods());

// tell the server to listen to events on a specific port
const server = app.listen( process.env.SB_PORT || 3000);
module.exports = server;

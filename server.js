const Koa = require('koa');
const pug = require('pug');
const path = require('path');
const Router = require('koa-router');
const config = require('./config');
const logger = require('./logger');
const sendMessage = require('./sendMessage');
const search = require('./wikipedia');

const app = new Koa();
const router = new Router();

app.use(require('koa-bodyparser')());

router.post(config.bot_token, async (ctx, next) => {
  try {
    const { message: { text, chat: { id: chatId } }} = ctx.request.body;

    const results = await search(text);

    const msg = pug.renderFile(path.join(__dirname, 'message.pug'), {
      results,
    });
    await sendMessage(chatId, msg);
  } catch (error) {
    logger.error(error);
  }

  ctx.body = 'ok';
});

app.use(router.routes());

app.listen(config.port);

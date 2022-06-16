const Koa = require('koa');
const pug = require('pug');
const path = require('path');
const Router = require('koa-router');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger');
const sendMessage = require('./sendMessage');
const search = require('./wikipedia');
const History = require('./History');

const app = new Koa();
const router = new Router();

app.use(require('koa-bodyparser')());

router.post(`/${config.bot_token}`, async (ctx, next) => {
  try {
    const { message: { text, chat: { id: chatId }, from: { id: userId } }} = ctx.request.body;

    if (text === '') {
      ctx.body = 'ok';
      return;
    }

    if (text === '/history') {
      const entities = await History.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)

      const history = entities.map(entity => entity.text);

      await sendMessage(chatId, history.join('\n'));

      ctx.body = 'ok';
      return;
    }

    await History.create({
      user: userId,
      text,
      createdAt: Date.now()
    });

    const results = await search(text);

    const msg = pug.renderFile(path.join(__dirname, 'message.pug'), {
      results,
    });
    await sendMessage(chatId, msg, 'HTML');
  } catch (error) {
    logger.error(error);
  }

  ctx.body = 'ok';
});

app.use(router.routes());

mongoose.connect(config.mongodb_uri);

app.listen(config.port);

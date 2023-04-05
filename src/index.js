import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import views from 'koa-views';
import { ChatGPTAPI } from 'chatgpt';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
let limit = 0;

const run = () => {
  let parentMessageId;
  const gptBot = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const app = new Koa();
  const router = new Router();

  app.use(
    views(__dirname + '/views', {
      extension: 'ejs',
    })
  );

  // 路由定义
  router.get('/', async (ctx, next) => {
    const q = (ctx.request.query.q || '').trim();
    if (!q) return next();

    try {
      limit++;
      if (limit > 100) return next();

      const res = await gptBot.sendMessage(q, { parentMessageId });
      parentMessageId = res.id;

      await ctx.render('index', {
        title: 'zl_gpt',
        message: res.text,
      });
    } catch (err) {
      ctx.body = err.message;
      ctx.status = 500;
    }

    next();
  });

  app.use(router.routes());

  app.listen(process.env.PORT, () =>
    console.log(`http://localhost:${process.env.PORT}`)
  );
};

export default {
  run,
};

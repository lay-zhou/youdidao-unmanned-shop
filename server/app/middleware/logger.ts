module.exports = () => {
  return async (ctx, next) => {
    const start = Date.now();
    console.log('=>', 'ctx.method', ctx.method);
    console.log('=>', 'ctx.url', ctx.url);
    console.log('=>', 'ctx.request', ctx.request);
    console.log('=>', 'ctx.request.body', ctx.request.body);
    await next();
    const ms = Date.now() - start;
    console.log('<=', `共计耗时${ms}ms`);
    console.log('<=', 'ctx.method', ctx.method);
    console.log('<=', 'ctx.url', ctx.url);
    console.log('<=', 'ctx.status', ctx.status);
    console.log('<=', 'ctx.body', ctx.body);
  };
};
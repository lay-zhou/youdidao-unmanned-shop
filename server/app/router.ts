/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { controller, router } = app;
  // 接收微信小程序微信支付结果通知
  router.post('/notify/wechat_pay', controller.notify.wechatPay);
  // 接收微信小程序微信支付结果通知
  router.post('/notify/index', controller.notify.index);
  // 扫码开门页面
  // router.get('/open', controller.code.openDoor);
  // 校验文件
  // router.get('/open/Sv98Ctew9b.txt', controller.verify.index);
};
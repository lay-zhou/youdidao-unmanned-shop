export const Mutation = {
  // 绑定手机号
  bindPhoneByUser(_root,
    { encryptedData, iv, code },
    ctx) {
    const params = { encryptedData, iv, code };
    return ctx.service.phone.bindPhoneByWx(params);
  },
};

export const User = {
  async phone({ id: userId }, _params, ctx) {
    const { Phone } = ctx.model;
    return await Phone.findOne({
      where: {
        userId
      },
    });
  },
}
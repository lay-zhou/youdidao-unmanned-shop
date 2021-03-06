module.exports = app => {
  const { CHAR, ENUM, INTEGER } = app.Sequelize;

  // 交易
  const TopUpTrade = app.model.define('topUp_trade', {
    // ID
    id: {
      type: CHAR(32),
      primaryKey: true,
      defaultValue: () => {
        // 生成32位交易单号
        const totalLength = 32;
        let string = String(new Date().getTime());
        for (let i = 0; i < totalLength - string.length; i++) {
          const num = Math.floor(Math.random() * 10);
          string += num;
        }
        return string;
      },
    },
    // 金额
    price: { type: INTEGER, allowNull: false },
    // 支付状态
    status: {
      type: ENUM,
      values: ['unpaid', 'paid'],
      allowNull: false,
      defaultValue: 'unpaid',
    },
  });
  TopUpTrade.associate = () => {
    const { TopUpOrder } = app.model;
    // 订单
    TopUpTrade.belongsTo(TopUpOrder);
  };
  return TopUpTrade;
};

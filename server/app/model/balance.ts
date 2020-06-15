'use strict';
module.exports = app => {
  const { BOOLEAN, INTEGER, STRING } = app.Sequelize;
  // 金额变动记录
  const Balance = app.model.define('balance', {
    balance: { type: INTEGER, allowNull: false }, // 余额
    price: { type: INTEGER, allowNull: false }, // 金额
    add: { type: BOOLEAN, allowNull: false }, // 增减与否
    remark: { type: STRING, allowNull: false }, // 备注
  });

  Balance.associate = () => {
    // 用户
    Balance.belongsTo(app.model.User);
    // 店铺
    Balance.belongsTo(app.model.Store);
    // 订单
    Balance.belongsTo(app.model.Order); 
    // 订单
    Balance.belongsTo(app.model.TopUpOrder); 
  };

  return Balance;
};

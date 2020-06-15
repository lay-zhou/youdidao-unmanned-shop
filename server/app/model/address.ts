module.exports = app => {
    const { STRING } = app.Sequelize;
  
    // 号码
    const Address = app.model.define('address', {
      // 收货人名称
      receiverName: STRING,
      // 收货手机号
      receiverPhone: STRING,
      // 收货地址
      receiverAddress: STRING,
    });
  
    Address.associate = () => {
      // 用户
      Address.belongsTo(app.model.Order);
    };
  
    return Address;
  };
  
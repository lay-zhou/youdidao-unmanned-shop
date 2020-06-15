module.exports = app => {
    const { STRING } = app.Sequelize;

    // 号码
    const Account = app.model.define('account', {
        
        // 收款人姓名
        name: STRING,

        // 手机号码
        phone: STRING,

        // 账户
        account: STRING,

        // 银行卡号
        card: STRING,

        // 微信id
        openId: STRING,
    });

    Account.associate = () => {
        // 用户
        Account.belongsTo(app.model.User);
    };

    return Account;
};

module.exports = app => {
    const { INTEGER, STRING, CHAR, ENUM } = app.Sequelize;

    // 横幅
    const Card = app.model.define('card', {
        // 生成6位数字的主键
        code: {
            type: CHAR(6),
            primaryKey: true,
            allowNull: false,
            defaultValue: () => {
                let code = '';
                for (let i = 0; i < 6; i++) {
                    const num = Math.floor(Math.random() * 10);
                    code += num;
                }
                return code;
            },
        },
        // 过期时间
        expiredDate: STRING(8),
        // 批次
        batch: INTEGER,
        // 状态
        status: {
            type: ENUM,
            values: ['unused', 'used'],
            allowNull: false,
            defaultValue: 'unused',
        },
        // 排序
        order: INTEGER,
    });

    Card.associate = () => {
        // 用户
        Card.belongsTo(app.model.User);
      };

    return Card;
};

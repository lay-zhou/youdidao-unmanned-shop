module.exports = app => {
  const { ENUM, INTEGER, STRING, TEXT, DECIMAL, BOOLEAN } = app.Sequelize;

  // 配置
  const Config = app.model.define('config', {
    // 主键
    key: { type: STRING, primaryKey: true },
    // 名称
    name: { type: STRING, allowNull: false },
    // 数据类型
    type: {
      type: ENUM,
      values: [ 'decimal5with5', 'html', 'integer', 'boolean','string' ],
      allowNull: false,
    },
    // 字符串类型
    string: STRING,
    // 布尔类型
    boolean: BOOLEAN,
    // 数字类型
    decimal5with5: DECIMAL(5, 5),
    // 整数类型值
    integer: INTEGER,
    // HTML类型值
    html: TEXT('medium'),
  });

  return Config;
};

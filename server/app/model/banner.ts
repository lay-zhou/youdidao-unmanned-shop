module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  // 横幅
  const Banner = app.model.define('banner', {
    // 位置
    position: { type: STRING, allowNull: false },
    // 标题
    title: { type: STRING, allowNull: false },
    // 图片
    imageKey: STRING,
    // 目标
    target: STRING,
    // 排序
    order: INTEGER,
  });

  return Banner;
};

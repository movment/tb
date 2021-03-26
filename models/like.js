module.exports = (sequelize) => {
  const Like = sequelize.define('Like', {}, { timestamps: false });
  return Like;
};

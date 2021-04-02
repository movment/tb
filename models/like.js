module.exports = (sequelize) => {
  const Like = sequelize.define('Likes', {}, { timestamps: false });
  return Like;
};

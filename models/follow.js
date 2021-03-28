module.exports = (sequelize) => {
  const Follow = sequelize.define('Follow', {}, { timestamps: false });
  return Follow;
};

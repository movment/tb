module.exports = (sequelize) => {
  const Follow = sequelize.define('Follows', {}, { timestamps: false });
  return Follow;
};

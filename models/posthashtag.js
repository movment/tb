module.exports = (sequelize) => {
  const PostHashtag = sequelize.define(
    'PostHashtags',
    {},
    { timestamps: false },
  );
  return PostHashtag;
};

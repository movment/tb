const { Sequelize, DataTypes } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);
const db = { sequelize, Sequelize };

db.Like = require('./like')(sequelize);
db.Follow = require('./follow')(sequelize);
db.Comment = require('./comment')(sequelize, DataTypes);
db.User = require('./user')(sequelize, DataTypes);
db.Post = require('./post')(sequelize, DataTypes);
db.Hashtag = require('./hashtag')(sequelize, DataTypes);
db.Image = require('./image')(sequelize, DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) db[modelName].associate(db);
});

module.exports = db;

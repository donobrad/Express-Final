'use strict';
module.exports = (sequelize, DataTypes) => {
  const posts = sequelize.define('posts', {
    PostId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    PostTitle: DataTypes.STRING,
    PostBody: DataTypes.STRING,
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'UserId'
      }
    },
    Deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {});
  posts.associate = function (models) {
    // associations can be defined here
    models.posts.belongsTo(models.users, { foreignKey: 'UserId' });
  };
  return posts;
};
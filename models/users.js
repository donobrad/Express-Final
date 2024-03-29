'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    UserId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    FirstName: DataTypes.STRING,
    LastName: DataTypes.STRING,
    Username: {
      type: DataTypes.STRING,
      unique: true
    },
    Password: DataTypes.STRING,
    Email: {
      type: DataTypes.STRING,
      unique: true
    },
    Admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    Deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {});
  users.associate = function (models) {
    // associations can be defined here
    models.users.hasMany(models.posts, { foreignKey: 'UserId'});
  };
  return users;
};
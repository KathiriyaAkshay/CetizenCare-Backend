'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
let config = require('../config/config')[env]
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {...config, dialect: 'postgresql'});
//   console.log(sequelize, '-----')
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {...config, dialect: 'postgresql'});
//   console.log(sequelize, '-------');
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
sequelize.options.logging = false
db.sequelize = sequelize;
db.Sequelize = Sequelize;
// console.log(db);
module.exports = db;


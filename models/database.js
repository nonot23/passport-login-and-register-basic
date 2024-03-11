const { Sequelize } = require('sequelize');
const UserModel = require('./User');

const sequelize = new Sequelize({
  dialect: 'mysql',
  username: 'root',
  password: 'kiop2323',
  database: 'nodejs_login',
  host: 'localhost',
});

const User = UserModel(sequelize);

sequelize.sync()
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

module.exports = {
  sequelize,
  User,
};
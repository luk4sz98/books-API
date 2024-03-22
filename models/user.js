const mongoose = require('mongoose');
const AccountStatus = require('./accountStatus');
const UserRole = require('./userRole');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  status: { type: Number, default: AccountStatus.INACTIVE },
  role: { type: Number, default: UserRole.STANDARD },
  jwtToken: String,
  activationToken: String
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;

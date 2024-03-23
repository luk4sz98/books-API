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
  activationToken: String
});

userSchema.methods.toDto = function() {
  const { password, activationToken, ...userDto } = this.toObject();
  return userDto;
};

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;

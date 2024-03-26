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
  refreshToken: String
});

userSchema.methods.toDto = function() {
  const { password, refreshToken, ...userDto } = this.toObject();
  return userDto;
};

const UserModel = mongoose.model('User', userSchema);

UserModel.createUser = function(firstName, lastName, email, password) {
  return new UserModel({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password
  });
};

module.exports = UserModel;

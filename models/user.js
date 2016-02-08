var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Job = require('./job');

var User = new mongoose.Schema({
  local : {
    email    : String,
    password : String
  },
  firstName: { type: String },
  lastName: { type: String },
  jobs : [Job.schema]
});

User.methods.encrypt = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

User.methods.isValidPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', User);

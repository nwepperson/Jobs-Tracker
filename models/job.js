var mongoose = require('mongoose');

var JobSchema = new mongoose.Schema({
  title: { type: String, require: true },
  employer: { type: String, require: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Job', JobSchema);

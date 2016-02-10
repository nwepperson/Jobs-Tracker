var mongoose = require('mongoose');

var JobSchema = new mongoose.Schema({
  title: { type: String, require: true },
  company: { type: String, require: true },
  city: { type: String, requirie: true },
  state: { type: String, require: true },
  country: { type: String, require: true },
  postDate: { type: String, require: true },
  description: { type: String, require: true },
  applyUrl: { type: String, require: true },
  jobkey: { type: String, require: true },
  applied: { type: Boolean, require: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Job', JobSchema);

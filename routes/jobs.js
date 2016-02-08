var express = require('express');
var router = express.Router();
var Todo = require('../models/job');

//INDEX
router.get('/', function(req, res, next) {
  //TODO get all the jobs and render index
  Job.find({})
  .then(function(jobs) {
    res.render('jobs/index', { jobs: jobs })
  }, function(err) {
    return next(err);
  });
});

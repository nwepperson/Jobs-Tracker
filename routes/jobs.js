var express = require('express');
var router = express.Router();
var Job = require('../models/job');
var api = require('indeed-api').getInstance("7726699244359231");

var authenticate = function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/');
  }
  else {
    next();
  }
};
// INDEX
router.get('/', authenticate, function(req, res, next) {
  var jobs = global.currentUser.jobs;
  res.render('jobs/index', { jobs: jobs, message: req.flash() });
});

// NEW
router.get('/new', authenticate, function(req, res, next) {
  var job = {
  title: '',
  company: '',
  city: '',
  state: '',
  country: '',
  postDate: '',
  description: '',
  applyUrl: ''
  };
  res.render('jobs/new', { job: job, message: req.flash() });
});

//SEARCH
router.post('/search', authenticate, function(req, res, next) {
  var currentUser = req.user;
  var filter = req.body.search;
  console.log(filter);
  api.JobSearch()
  .WhereKeywords([filter])
  .SortBy("date")
  .UserIP("1.2.3.4")
  .UserAgent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36")
  .Search(
    function (results) {
    res.render('jobs/search', { results: results.results, message: req.flash() });
    console.log(results.results[0].jobkey);
  },
    function (error) {
    // do something with the error results
    console.log(error);
  });
  // var doSearch = function (params, done, fail) {
  // $.ajax({ [Initial Parameters] }, params),
  //   dataType: 'jsonp',
  //   type: 'GET',
  //   timeout: 5000,
  //   url: 'http://api.indeed.com/ads/apisearch'
  // }).done(done).fail(fail);
  // };
});

//ADD
router.post('/add', authenticate, function(req, res, next) {
  console.log(req.body.add);
  var currentUser = req.user;


//getinfo
  currentUser.jobs.push(job);
  currentUser.save()
  .then(function() {
    res.redirect('/jobs');
  }, function(err) {
    return next(err);
  });
});

// SHOW
router.get('/:id', authenticate, function(req, res, next) {
  var job = currentUser.jobs.id(req.params.id);
  if (!job) return next(makeError(res, 'Document not found', 404));
  res.render('jobs/show', { job: job, message: req.flash() } );
});

// CREATE
router.post('/', authenticate, function(req, res, next) {
  var job = {
    title: req.body.title,
  company: req.body.company,
  city: req.body.city,
  state: req.body.state,
  country: req.body.country,
  postDate: req.body.postDate,
  description: req.body.description,
  applyUrl: req.body.applyUrl
  };
  // Since a user's jobs are an embedded document, we just need to push a new
  // JOB to the user's list of jobs and save the user.
  currentUser.jobs.push(todo);
  currentUser.save()
  .then(function() {
    res.redirect('/jobs');
  }, function(err) {
    return next(err);
  });
});

// EDIT
router.get('/:id/edit', authenticate, function(req, res, next) {
  var job = currentUser.jobs.id(req.params.id);
  if (!job) return next(makeError(res, 'Document not found', 404));
  res.render('jobs/edit', { job: job, message: req.flash() } );
});

// UPDATE
router.put('/:id', authenticate, function(req, res, next) {
  var job = currentUser.jobs.id(req.params.id);
  if (!job) return next(makeError(res, 'Document not found', 404));
  else {
    job.title = req.body.title;
    job.employer = req.body.employer;
    currentUser.save()
    .then(function(saved) {
      res.redirect('/todos');
    }, function(err) {
      return next(err);
    });
  }
});

// DESTROY
router.delete('/:id', authenticate, function(req, res, next) {
  var job = currentUser.jobs.id(req.params.id);
  if (!job) return next(makeError(res, 'Document not found', 404));
  var index = currentUser.jobs.indexOf(job);
  currentUser.jobs.splice(index, 1);
  currentUser.save()
  .then(function(saved) {
    res.redirect('/jobs');
  }, function(err) {
    return next(err);
  });
});

module.exports = router;

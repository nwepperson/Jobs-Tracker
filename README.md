NEW PROJECT STARTUP

#!/bin/bash
express --ejs jobs
cd jobs
npm install
echo '#!/bin/bash' > run.bash
echo 'DEBUG=jobs:* npm start' >> run.bash
chmod u+x run.bash

npm install --save mongoose
npm install --save method-override
npm install --save kerberos

edit package.json and change node to nodemon

mkdir models
touch models/job.js

edit job.js [

var mongoose = require('mongoose');

var JobSchema = new mongoose.Schema({
  title: { type: String, require: true },
  employer: { type: String, require: true }
});

module.exports = mongoose.model('Job', JobSchema);

]

edit app.js [

var methodOverride = require('method-override');
app.use(methodOverride('_method'));
var mongoose = require('mongoose');

*****after [var app = express();] add:
mongoose.connect('mongodb://localhost/jobs');

]

touch routes/jobs.js
edit jobs.js [

var express = require('express');
var router = express.Router();
var Job = require('../models/job');

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

]

mkdir views/jobs
touch views/jobs/index.ejs
edit views/jobs/index.ejs [

<!doctype html>
<html lang='en'>
<head>
  <% include ../partials/head %>
</head>

<body>
  <header>
    <% include ../partials/header %>
  </header>

  <main>
    <div>
      <h1>JOBS:</h1>
    </div>
  </main>

  <footer>
    <% include ../partials/footer %>
  </footer>
</body>
</html>

]

mkdir views/partials
touch views/partials/head.ejs views/partials/header.ejs views/partials/footer.ejs
edit views/partials/head.ejs [

<title>JOBS</title>
<link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="/stylesheets/style.css">

]

edit views/partials/header.ejs [

<nav class="navbar navbar-default" role="navigation">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="#">
        <span class="glyphicon glyphicon glyphicon-tree-deciduous"></span>JOBS
      </a>
    </div>
​
    <ul class="nav navbar-nav">
      <li><a href="/">Home</a></li>
      <li><a href="/todos">JOBS</a></li>
    </ul>
  </div>
</nav>

]

edit views/partials/footer.ejs [

<p class="text-center text-muted">&copy; Copyright 2016 Team Kickass</p>

]

npm install --save passport
npm install --save passport-local
npm install --save bcrypt-nodejs
npm install --save connect-flash
npm install --save express-session

edit app.js add [

var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');

app.use(session({
secret: 'WDI Rocks!',
resave: true,
saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport/passport')(passport);

// This middleware will allow us to use the currentUser in our views and routes.
app.use(function (req, res, next) {
  global.currentUser = req.user;
  next();
});

]

touch models/user.js
edit user.js add [

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Job = require('./job');

var User = new mongoose.Schema({
  local : {
    email    : String,
    password : String
  },
  jobs : [Job.schema]
});

User.methods.encrypt = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

User.methods.isValidPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', User);

]

mkdir -p config/passport
touch config/passport/passport.js config/passport/local-signup-strategy.js config/passport/local-login-strategy.js

edit config/passport/passport.js and add [

var localSignupStrategy = require('./local-signup-strategy');
var localLoginStrategy  = require('./local-login-strategy');
var User = require('../../models/user');

var passportConfig = function(passport) {

  // Strategies
  passport.use('local-signup', localSignupStrategy);
  passport.use('local-login' , localLoginStrategy);

  // Session Support
  passport.serializeUser(function(user, callback) {
    callback(null, user.id);
  });

  passport.deserializeUser(function(id, callback) {
    User.findById(id, function(err, user) {
      callback(err, user);
    });
  });
};

module.exports = passportConfig;

]

Edit config/passport/local-signup-strategy.js and add [

var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../../models/user');

var strategy = new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, callback) {
    // Find a user with this e-mail
    User.findOne({ 'local.email' :  email }, function(err, user) {
      if (err) return callback(err);
      if (user) {
        // A user with this email already exists
        return callback(null, false, req.flash('error', 'This email is already taken.'));
      }
      else {
        // Create a new user
        var newUser            = new User();
        newUser.local.email    = email;
        newUser.local.password = newUser.encrypt(password);

        newUser.save(function(err) {
          return callback(err, newUser);
        });
      }
    });
  });

module.exports = strategy;

]

Edit config/passport/local-login-strategy.js and add[

var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../../models/user');

var strategy = new LocalStrategy({
    usernameField : 'email',                 // default is 'username'
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, callback) {
    // Search for a user with this email
    User.findOne({ 'local.email' : email }, function(err, user) {
      if (err) return callback(err);

      // If no user is found
      if (!user) {
        return callback(null, false, req.flash('error', 'User not found.'));
      }

      // Validate password
      if (!user.isValidPassword(password)) {
        return callback(null, false, req.flash('error', 'Oops! Wrong password.'));
      }
      return callback(null, user);
    });
  });

module.exports = strategy;

]

edit views/partials/header add BELOW NAVBAR DIV[

<div class="flash">
  <% if (typeof message !== 'undefined') { %>
    <% if (typeof message.error !== 'undefined' && message.error.length > 0) { %>
      <div class="bg-danger"><%= message.error %></div>
    <% } %>
    <% if (typeof message.info !== 'undefined' && message.info.length > 0) { %>
      <div class="bg-info"><%= message.info %></div>
    <% } %>
    <% if (typeof message.success !== 'undefined' && message.success.length > 0) { %>
      <div class="bg-success"><%= message.success %></div>
    <% } %>
  <% } %>
</div>

Update the navbar links in views/partials/header.ejs to look like the following:

<ul class="nav navbar-nav navbar-left">
      <li><a href="/">Home</a></li>
      <% if (currentUser) { %>
        <li><a href="/todos">TODOs</a></li>
      <% } %>
    </ul>
    <ul class="nav navbar-nav navbar-right">
      <% if (currentUser) { %>
        <li><a href="#"><%= currentUser.local.email %></a></li>
        <li><a href="/logout">Logout</a></li>
      <% } else { %>
        <li><a href="/login">Login</a></li>
        <li><a href="/signup">Signup</a></li>
      <% } %>
    </ul>

]

Edit routes/index.js and add the following routes[

var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Jobs Tracker', message: req.flash() });  // add the message
});

// GET /signup
router.get('/signup', function(req, res, next) {
  res.render('signup.ejs', { message: req.flash() });
});

// POST /signup
router.post('/signup', function(req, res, next) {
  var signUpStrategy = passport.authenticate('local-signup', {
    successRedirect : '/jobs',
    failureRedirect : '/signup',
    failureFlash : true
  });

  return signUpStrategy(req, res, next);
});

// GET /login
router.get('/login', function(req, res, next) {
  res.render('login.ejs', { message: req.flash() });
});

// POST /login
router.post('/login', function(req, res, next) {
  var loginProperty = passport.authenticate('local-login', {
    successRedirect : '/jobs',
    failureRedirect : '/login',
    failureFlash : true
  });

  return loginProperty(req, res, next);
});

// GET /logout
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

// Restricted page
router.get('/secret', function(req, res, next) {
  if (currentUser) {
    res.render('secret.ejs');
  }
  else {
    res.redirect('/');
  }
});

]

touch views/signup.ejs views/login.ejs views/secret.ejs

edit views/signup.ejs [

<!doctype html>
<html lang="en">
  <head>
    <% include partials/head %>
  </head>

  <body class="container-fluid">
    <header>
      <% include partials/header %>
    </header>

    <main>
      <div>
        <h2>Signup</h2>
        <form method="post" action="/signup">
          <div class="form-group">
            <label for="email">Email</label>
            <input class="form-control" type="text" name="email" id="email">
          </div>

          <div class="form-group">
            <label for="email">Password</label>
            <input class="form-control" type="password" name="password" id="password">
          </div>

          <input class="btn btn-default" type="submit">
        </form>
      </div>
    </main>

    <footer>
      <% include partials/footer %>
    </footer>
  </body>
</html>

]

Add the following to views/login.ejs [

<!doctype html>
<html lang="en">
  <head>
    <% include partials/head %>
  </head>

  <body class="container-fluid">
    <header>
      <% include partials/header %>
    </header>

    <main>
      <div>
        <h2>Login</h2>
          <form method="post" action="/login">
            <div class="form-group">
              <label for="email">Email</label>
              <input class="form-control" type="text" name="email" id="email">
            </div>

            <div class="form-group">
              <label for="email">Password</label>
              <input class="form-control" type="password" name="password" id="password">
            </div>

            <input class="btn btn-default" type="submit">
          </form>
      </div>
    </main>

    <footer>
      <% include partials/footer %>
    </footer>
  </body>
</html>

]

Add the following to views/secret.ejs [

<!doctype html>
<html lang="en">
  <head>
    <% include partials/head %>
  </head>

  <body class="container-fluid">
    <header>
      <% include partials/header %>
    </header>

    <main>
      <div class="jumbotron">
        <h1>Congrats! You have reached the <span style="color: red">SECRET</span> page</h1>
      </div>
    </main>

    <footer>
      <% include partials/footer %>
    </footer>
  </body>
</html>

]

edit routes/jobs.js add [

var authenticate = function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/');
  }
  else {
    next();
  }
};

]

edit routes/jobs.js replace all routes with: [

// INDEX
router.get('/', authenticate, function(req, res, next) {
  var jobs = global.currentUser.jobs;
  res.render('jobs/index', { jobs: jobs, message: req.flash() });
});

// NEW
router.get('/new', authenticate, function(req, res, next) {
  var job = {
    title: '',
    employer: ''
  };
  res.render('jobs/new', { job: job, message: req.flash() });
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
    employer: req.body.employer
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

]

touch db.js
edit db.js [

var mongoose = require('mongoose');

var db = mongoose.connection;

// CONNECTION EVENTS
db.once('open', function() {
  console.log("Opened mongoose.");
});
db.once('close', function() {
  console.log("Closed mongoose.");
});
db.on('connected', function() {
  console.log('Mongoose connected to ' + db.host + ':' + db.port + '/' + db.name);
});
db.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});
db.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
  db.close(function() {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};
// For nodemon restarts
process.once('SIGUSR2', function() {
  gracefulShutdown('nodemon restart', function() {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0);
    });
});
// For Heroku app termination
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app termination', function() {
    process.exit(0);
  });
});

module.exports = db;

]




***************************************
to run: ./run.bash
touch seeds.js
edit seeds.js [

var mongoose = require('mongoose');
var Todo = require('./models/todo');

mongoose.connect('mongodb://localhost/jobs');

// our app will not exit until we have disconnected from the db.
function quit() {
  mongoose.disconnect();
  console.log('\nQuitting!');
}// a simple error handler
function handleError(err) {
  console.log('ERROR:', err);
  quit();
  return err;
}

console.log('removing old todos...');
Todo.remove({})
.then(function() {
  console.log('removed old todos');
  console.log('creating new todos');
  var groceries = new Todo({ title: 'groceries', completed: false });
  var feedTheCat = new Todo({ title: 'feed the cat', completed: true});
  return Todo.create([groceries, feedTheCat]);
})
.then(function(savedTodos) {
  console.log('Todo has been saved.');
  return Todo.find({});
})
.then(function(allTodos) {
  console.log('Printing all todos...');
  allTodos.forEach(function(todo) {
    console.log(todo);
  });
  quit();
});

]

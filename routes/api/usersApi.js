const { forwardAuthenticated, ensureAuthenticated } = require('../../config/auth');
const crypto = require('crypto');
const async = require('async');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('../../models/User');

module.exports = (app,passport) => {
  app.get('/',(req,res)=>{
    res.send('API working just fine..');
  });

  //======= ON signup Success
app.get('/api/users/signup/success', (req,res) => {
  res.status(200).json({ user: req.user });
});
//======ON signup Failure
app.get('/api/users/signup/failure', (req,res) => {
  res.json({ signupErrors: req.flash('signupMessage') });
});
//======ON login success
app.get('/api/users/login/success', ensureAuthenticated, (req,res) => {
  res.json({ user: req.user });
});
//=====ON login failure
app.get('/api/users/login/failure', (req,res) => {
  res.json({ loginErrors: req.flash('loginMessage') });
});

  // @route POST api/users/signup
// @desc signup user
// @access Public
app.post(
	'/api/users/signup',
    passport.authenticate('local-signup', {
      successRedirect: '/api/users/signup/success',
      failureRedirect: '/api/users/signup/failure',
      failureFlash: true,
    })

);


// @route POST api/users/login
// @desc Login user
// @access Public
app.post(
	'/api/users/login', forwardAuthenticated,
	passport.authenticate('local-login', {
		successRedirect: '/api/users/login/success', 
		failureRedirect: '/api/users/login/failure', 
		failureFlash: true, // allow flash messages
	})
);

app.post('/api/users/logout', (req, res) => {
	req.logout();
	res.json({ status: 'You are logged out' });
});
app.post('/api/users/forgot-password', function(req,res,next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ 'local.email': req.body.email }, function(err,user) {
        if(!user) {
          return res.json({ forgotPasswordError: 'No account with that email address exists.' });
        }

        user.local.resetPasswordToken = token;
        user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save( function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      const transporter = nodemailer.createTransport( {
        service: 'gmail',
        auth: {
          user: 'kharljay15@gmail.com',
          pass: process.env.GMAIL_PASSWORD
        }
      });
      const mailOptions = {
        to: user.local.email,
        from: 'kal@books.com',
        subject: 'Books Password Reset',
        text: 'You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n' + 
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' + 
              'http://' + req.headers.host + '/api/users/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        res.status(200).json({ passwordResetInfo: 'An e-mail has been sent to ' + user.local.email + ' with further instructions.' });
        done(err,done);
      });
    }
  ], function(err) {
    if(err) return next(err);
  });
});

// @ Password reset route
app.get('/api/users/reset/:token', function(req,res) {
  User.findOne({
    'local.resetPasswordToken' : req.params.token,
    'local.resetPasswordExpires' : { $gt: Date.now() }
  }, function(err,user) {
    if(!user) {
      return res.json({ passwordResetError: 'Password reset token is invalid or has expired.' });
    }
    res.status(200).json({ user });
  });
});

//@ route to handle password reset
app.post('/api/users/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ 
        'local.resetPasswordToken': req.params.token,
        'local.resetPasswordExpires': {$gt: Date.now() }
      }, function(err, user) {
        if(!user) {
          return res.send(403).json({ passwordResetToken: 'password reset token is invalid or has expired.' });
        }

        user.local.password = req.body.password;
        user.local.resetPasswordToken = undefined;
        user.local.resetPasswordExpires = undefined;

        user.save( function(err) {
          req.logIn(user, function(err) {
            done(err,user);
          });
        });
      });
    },
    function(user, done) {
      const transporter = nodemailer.createTransport( {
        service: 'SendGrid',
        auth: {
          user: 'kharljay15@gmail.com',
          pass: process.env.GMAIL_PASSWORD
        }
      });
      const mailOptions = {
        to: user.local.email,
        from: 'kal@books.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' + 
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n' 
      };
      transporter.sendMail(mailOptions, function(err) {
        res.status(200).json({ passwordResetMessage: 'Success! Your password has been changed.'});
        done(err);
      });
    }
  ]);
});

// route middleware to make sure a user is logged in
const isLoggedIn = (req, res, next) => {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

}



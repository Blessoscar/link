// load all the things we need
const LocalStrategy = require('passport-local').Strategy;
const validateSignupInput = require('../validation/signup');
const validateLoginInput = require('../validation/login');
const bcrypt   = require('bcrypt-nodejs');

//load up the user model
const User = require('../models/User');

// expose this function to our app
module.exports = passport => {
	/**
	 * passport session setup =======================
	 * required for persistent login sessions
	 * serialize and unserialize users out of session
	 */
	//serialize the user for the session
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	//deserialize the user
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});

	/**
	 * LOCAL SIGNUP
	 * using named strategies
	 */
	// local signup
	passport.use(
		'local-signup',
		new LocalStrategy(
			{
				usernameField: 'email',
				passwordField: 'password',
				passReqToCallback: true,
			},
			(req, email, password, done) => {
				process.nextTick(() => {
					 // Form validation
					const { errors, isValid } = validateSignupInput(req.body);

					// Check validation
					if (!isValid) {
						return req.flash({ 'invalidInput': errors});
					} 

					// find a user whose email is the same as the forms email
					User.findOne({ 'local.email': email }, (err, user) => {
						if (err) return done(err);
						// check to see if theres already a user with that email
						if (user) {
							return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
						} else {
							// if there is no user with that email
							// create the user
							var newUser = new User();

							// set the user's local credentials
							newUser.local.email = email;
							newUser.local.password = newUser.generateHash(password);

							// save the user
							newUser.save(err => {
								if (err) throw err;
								return done(null, newUser);
							});
						}
					});
				});
			}
		)
	);

	// =========================================================================
	// LOCAL LOGIN =============================================================
	passport.use(
		'local-login',
		new LocalStrategy(
			{
				usernameField: 'email',
				passwordField: 'password',
				passReqToCallback: true,
			},
			(req, email, password, done) => {
				// Form validation
				const { errors, isValid } = validateLoginInput(req.body);
				// Check validation
				if (!isValid) {
					return req.flash('loginMessage', errors);
				}
				// checking to see if the user trying to login already exists
				User.findOne({ 'local.email': email }, function(err, user) {
					// if there are any errors, return the error before anything else
					if (err) return done(err);

					// if no user is found, return the message
					if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));

					// if the user is found but the password is wrong
						let correctPassword = bcrypt.compareSync(password,user.local.password);
				
					if (!correctPassword)
						return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

					// If all is well, return successful user
					return done(null, user);
				});
			}
		)
	);
};

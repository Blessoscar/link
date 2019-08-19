//get all the tools we need
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

//Initializing dotenv to read .env file
dotenv.config();

//Initialize app with express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// configuration==========================================
const db = process.env.mongoURI; // mongodb


//connect to mongoDB
mongoose
	.connect(db, { useNewUrlParser: true })
	.then(() => console.log('mongoDB connected successfully'))
	.catch(err => console.log(err));
	
require('./config/passport')(passport); //pass passport for configuration
app.use(morgan('dev')); //log every request to the console
app.use(cookieParser()); // read cookies (neeeded for auth)

// required for passport
// Express session
app.use(
	session({
		secret: 'kalshitonly',
		resave: true,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session()); // passport login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ==============================================================
require('./routes/api/usersApi')(app, passport);
//require('./routes/api/booksApi')(app,passport);
const books = require('./routes/api/booksApi');

//app.use('/api/users', users);
app.use('/api/books', books);

//set up PORT =======================
const PORT = process.env.PORT || 5000;

//Listen for requests
app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));

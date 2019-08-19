// Pulling in required dependencies
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

//Creat UserSchema
const UserSchema = new Schema({
	local: {
		email: String,
		password: String,
		resetPasswordToken: String,
		resetPasswordExpires: Date
	},
	role: {
		type: String,
		default: 'user',
	},
	books_downloaded: {
		booksId: {
			type: Array,
			required: false,
		},
	},
	books_needed: {
		type: Object,
		default: null,
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	updated_at: {
		type: Date,
		default: Date.now
	}
});

// methods=====================================================
// generating a hash
UserSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

//Hashing password on update
UserSchema.pre('update', function(next) {
	const password = this.getUpdate().$set.local.password;
	if(!password) return next();

	try {
		//Generate salt
		const SALT_FACTOR = 5;

		bcrypt.genSalt(SALT_FACTOR, function(err,salt) {
			if(err) return next(err);
			
			bcrypt.hash(password, salt, null, function(err,hash) {
				if(err) return next(err);
				this.getUpdate().$set.local.password = hash;
				next();
			});
		});
	} catch(error) {
		return next(error);
	}

});

// expose User model to the app
module.exports = mongoose.model('User', UserSchema);

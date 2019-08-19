const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const router = express.Router();

// Load Book model
const Book = require('../../models/Book');

const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpg', 'image/png', 'image/tif'];
const bookCoverStorage = multer.diskStorage({
	dest: uploadPath,
	fileFilter: (req, file, callback) => {
		callback(null, imageMimeTypes.includes(file.mimetype));
	},
});

const uploadBookCover = multer({ storage: bookCoverStorage });

router.post('/create-book', uploadBookCover.single('book-cover'), (req, res) => {
	/**
	 * Validation will go here...
	 */
	let img = fs.readFileSync(req.file.path);
	let encode_image = img.toString('base64');

	const finalImg = {
		contentType: req.file.mimetype,
		image: new Buffer.from(encode_image, 'base64'),
	};
	const cover_photo = finalImg;

	const newBook = new Book({
		...req.body
	});
	newBook.cover_photo = cover_photo;

	if(req.body.publishDate !== undefined) {
		newBook.publishDate = new Date(req.body.publishDate);
	}
	newBook
		.save()
		.then(book => res.json(book))
		.catch(err => {
			console.log(err);
			return res.json({ error: 'There was an Error creating your book, please try again' });
		});
	if(cover_photo) {
		fs.unlink(path.join(uploadPath,req.file.filename), err => {
			if(err) console.error(err);
		})
	}
});

router.get('/book-cover/:id', (req, res) => {
	const id = req.params.id;
	Book.findOne({ _id: id }, (err, result) => {
		if (err) return console.error(err);

		res.contentType('image/jpeg');
		res.send(result.cover_photo.image.buffer);
	});
});
router.get('/:id', (req, res) => {
	const id = req.params.id;
	Book.findOne({ _id: id }, (err, result) => {
		if (err) return console.error(err);

		res.json(result);
	});
});

router.get('/', (req, res) => {
	Book.find( (err, result) => {
		if (err) return console.error(err);
		res.json(result);
	});
});

// Mongo URI
const mongoURI = 'mongodb://127.0.0.1:27017/bookstore';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
	// Init stream
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('bookFiles');
});

// Create storage engine
const bookStorage = new GridFsStorage({
	url: mongoURI,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (err, buf) => {
				if (err) {
					return reject(err);
				}
				const filename = buf.toString('hex') + path.extname(file.originalname);
				const fileInfo = {
					filename: filename,
					bucketName: 'bookFiles',
				};
				resolve(fileInfo);
			});
		});
	},
});
const uploadBook = multer({ storage: bookStorage });

// @route GET /
// @desc Returns an array of books
router.get('/', (req, res) => {
	gfs.files.find().toArray((err, files) => {
		// Check if files
		if (!files || files.length === 0) {
			res.json({ error: ' No books avaible' });
		} else {
			res.json(files);
		}
	});
});

// @route POST /upload
// @desc  Uploads file to DB
router.post('/upload', uploadBook.single('book'), (req, res) => {
	res.json({ file: req.file });
	//res.redirect('/');
});

// @route GET /files
// @desc  Display all files in JSON
router.get('/files', (req, res) => {
	gfs.files.find().toArray((err, files) => {
		// Check if files
		if (!files || files.length === 0) {
			return res.status(404).json({
				err: 'No files exist',
			});
		}

		// Files exist
		return res.json(files);
	});
});

// @route GET /files/:filename
// @desc  Display single file object
router.get('/files/:filename', (req, res) => {
	gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
		// Check if file
		if (!file || file.length === 0) {
			return res.status(404).json({
				err: 'No file exists',
			});
		}
		// File exists
		return res.json(file);
	});
});

// @route DELETE /files/:id
// @desc  Delete file
router.delete('/files/:id', (req, res) => {
	gfs.remove({ _id: req.params.id, root: 'bookFiles' }, (err, gridStore) => {
		if (err) {
			return res.status(404).json({ err: err });
		}

		res.json({ message: `Book file with id : ${req.params.id} has been deleted successfully` });
	});
});

module.exports = router;

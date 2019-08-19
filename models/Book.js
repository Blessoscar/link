// Pulling in required dependencies
const coverImageBasePath = "uploads/bookCovers";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create BookSchema
const BookSchema = new Schema({
    category: {
        type: String,
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date
    },
    pageCount: {
        type: Number
    },
    file_id: {
    },
    cover_photo: {
    },
    title: {
        type: String,
    },
    author: {
        type: String,
        required: false
    },
    notification: {
        type: String,
        required: false
    },
    price: {
        type: String
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

//file path


module.exports = mongoose.model('Book', BookSchema);
module.exports.coverImageBasePath = coverImageBasePath;

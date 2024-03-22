const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  releaseYear: Number,
  publisher: String,
  category: String,
  price: Number,
  description: String
});

const BookModel = mongoose.model('Book', bookSchema);

module.exports = BookModel;

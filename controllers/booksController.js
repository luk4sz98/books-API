const BookModel = require('../models/book');
const mongoose = require('mongoose')

class BooksController {
    async getBooks(req, res, next) {
        try {
            const books = await BookModel.find();
            if (books) {
                return res.status(200).json(books);
            } else {
                return res.status(204).send();
            }
        } catch (error) {
            next(error);
        }
    }

    async getBookById(req, res, next) {
        try {
            const id = req.params.id;
            if (mongoose.Types.ObjectId.isValid(id)) {
                const book = await BookModel.findById(id)
                if (book) {
                    return res.status(200).json(book);
                } else {
                    return res.status(204).send();
                }
            } else {
                return res.status(400).json({ message: "Niepoprawne id" })
            }
        } catch (error) {
            next(error);
        }
    }

    async getBooksByCategory(req, res, next) {
        try {
            const category = req.params.name;
            if (!category) {
                return res.status(400).json({ message: "Brak nazwy kategorii" });
            }

            const books = await BookModel.find({ category: { $regex: category, $options: 'i' } });
            if (books.length > 0) {
                return res.status(200).json(books)
            } else {
                return res.status(204).send()
            }
        } catch (error) {
            next(error);
        }
    }

    async getBooksByYear(req, res, next) {
        try {
            const year = req.params.year;
            if (year < 1900 || year > 2024) {
                return res.status(400).json({ message: "Nieprawidłowy rok wydania" });
            }
            
            const books = await BookModel.find({ releaseYear: year});
            if (books.length > 0) {
                return res.status(200).json(books)
            } else {
                return res.status(204).send()
            }
        } catch (error) {
            next(error)
        }
    }
}

module.exports = BooksController
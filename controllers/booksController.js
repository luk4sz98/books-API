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

    async addNewBook(req, res, next) {
        try {
            const newBook = this.#createBook(req.body);
            await newBook.save();
            return res.sendStatus(201);
        } catch (error) {
            next(error)
        }
    }

    async deleteBook(req, res, next) {
        try {
            const bookId = req.params.id;
            if (mongoose.Types.ObjectId.isValid(bookId)) {
                const result = await BookModel.findByIdAndDelete(bookId);
                if (result == null)
                    return res.status(404).json( {message: 'Brak książki o podanym id.' });
                return res.sendStatus(204);
            } else {
                return res.status(400).json({ message: "Niepoprawny format id." })
            }
        } catch (error) {
            next(error);
        }
    }

    async updateBook(req, res, next) {
        try {
            const bookId = req.params.id;
            if (mongoose.Types.ObjectId.isValid(bookId)) {
                const updatedBook = this.#createBook(req.body);
                const result = await BookModel.updateOne(
                    { _id: bookId}, 
                    { 
                        title: updatedBook.title, author: updatedBook.author, description: updatedBook.description, price: updatedBook.price,
                        category: updatedBook.category, releaseYear: updatedBook.releaseYear, publisher: updatedBook.publisher
                     })
                if (result.matchedCount == 0) {
                    return res.status(404).json({ message: 'Brak książki o podanym id.' });
                }
                return res.sendStatus(204);
            } else {
                return res.status(400).json({ message: "Niepoprawny format id." })
            }
        } catch (error) {
            next(error);
        }
    }


    #createBook(body) {
        const { title, author, releaseYear, publisher, category, price, description } = body;
        return new BookModel({
            title: title,
            author: author,
            category: category,
            description: description,
            price: price,
            publisher: publisher,
            releaseYear: releaseYear
        })
    }
}

module.exports = BooksController
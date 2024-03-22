const { Router } = require('express');
const BooksController = require('../controllers/booksController')

const router = Router();
const booksController = new BooksController()

router.get('/', async (req, res, next) => {
    await booksController.getBooks(req, res, next);
});

router.get('/:id', async (req, res, next) => {
    await booksController.getBookById(req, res, next)
})

router.get('/category/:name', async (req, res, next) => {
    await booksController.getBooksByCategory(req, res, next);
})

router.get('/year/:year', async (req, res, next) => {
    await booksController.getBooksByYear(req, res, next);
})

module.exports = router;
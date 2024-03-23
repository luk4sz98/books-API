const { Router } = require('express');
const BooksController = require('../controllers/booksController')
const jwtMiddleware = require('../middleware/jwtMiddleware');

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

router.post('/', 
    jwtMiddleware.authenticateToken,
    async (req, res, next) => {
        await booksController.addNewBook(req, res, next);
    }
)

router.delete('/:id', 
    jwtMiddleware.authenticateToken,
    async (req, res, next) => {
        await booksController.deleteBook(req, res, next);
    }
)

router.put('/:id',
    jwtMiddleware.authenticateToken,
    async (req, res, next) => {
        await booksController.updateBook(req, res, next);
    }
)

module.exports = router;
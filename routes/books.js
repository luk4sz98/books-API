const { Router } = require('express');
const BooksController = require('../controllers/booksController')
const jwtMiddleware = require('../middleware/jwtMiddleware');

const router = Router();
const booksController = new BooksController()


// pobranie wszystkich książej
router.get('/', async (req, res, next) => {
    await booksController.getBooks(req, res, next);
});


// pobranie wybranej książki na podstawie przesłanego id
router.get('/:id', async (req, res, next) => {
    await booksController.getBookById(req, res, next)
})

// pobranie książek o określonej kategorii
router.get('/category/:name', async (req, res, next) => {
    await booksController.getBooksByCategory(req, res, next);
})

// pobranie książek o określonym roku wydania
router.get('/year/:year', async (req, res, next) => {
    await booksController.getBooksByYear(req, res, next);
})

// dodanie nowej książki
// DOSTĘPNE TYLKO DLA AUTORYZOWANYCH UŻYTKOWNIKÓW
router.post('/', 
    jwtMiddleware.authenticateToken,
    async (req, res, next) => {
        await booksController.addNewBook(req, res, next);
    }
)

// usunięcie wybranej książki
// DOSTĘPNE TYLKO DLA AUTORYZOWANYCH UŻYTKOWNIKÓW
router.delete('/:id', 
    jwtMiddleware.authenticateToken,
    async (req, res, next) => {
        await booksController.deleteBook(req, res, next);
    }
)


// zaaktualizowanie wybranej książki
// DOSTĘPNE TYLKO DLA AUTORYZOWANYCH UŻYTKOWNIKÓW
router.put('/:id',
    jwtMiddleware.authenticateToken,
    async (req, res, next) => {
        await booksController.updateBook(req, res, next);
    }
)

module.exports = router;
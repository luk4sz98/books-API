const { Router } = require('express');
const AdminController = require('../controllers/adminController');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const accountCheckerMiddleware = require('../middleware/accountCheckerMiddleware');
const router = Router();
const adminController = new AdminController();

router.use(jwtMiddleware.authenticateToken, accountCheckerMiddleware.isAdminRole)

// pobieranie listy użytkowników
router.get('/users', async (res, req, next) => {
    await adminController.getUsers(res, req, next);
})

// kasowanie usera na podstawie przesłanego id
router.delete('/users/:id', async (res, req, next) => {
    await adminController.deleteUser(res, req, next);
})

// aktualizacja roli użytkownika na podstawie przesłanego id oraz roli w body requesta
router.patch('/users/:id', async (req, res, next) => {
    await adminController.changeUserRole(req, res, next);
})

// utworzenie nowego użytkownika z tymczasowym hasłem przez admina
router.post('/users', async (req, res, next) => {
    await adminController.createUser(req, res, next);
})

//TODO: Dodanie endpointa do wysłania maila do podanych użytkowników (lista maili w body requesta)

module.exports = router;
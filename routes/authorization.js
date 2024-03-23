const { Router } = require('express');
const AuthController = require('../controllers/authorizathionController');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const accountStatusMiddleware = require('../middleware/accountStatusMiddleware');

const router = Router();
const authController = new AuthController()

router.post('/login', 
    accountStatusMiddleware.checkStatus, 
    async (req, res, next) => {
        await authController.login(req, res, next)
    }        
);

router.post('/register', async (req, res, next) => {
    await authController.registration(req, res, next);
})

router.post('/password/reset', async (req, res, next) => {
    await authController.resetPassword(req, res, next);
})

router.post('/password/reset/change', async (req, res, next) => {
    await authController.setNewPassword(req, res, next)
})

router.get('/activate/:token', async (req, res) => {
    await authController.activate(req, res);
});

module.exports = router;
const { Router } = require('express');
const AuthController = require('../controllers/authorizathionController');
const accountStatusMiddleware = require('../middleware/accountCheckerMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');

const router = Router();
const authController = new AuthController()

router.post('/login', 
    accountStatusMiddleware.checkStatus, 
    async (req, res, next) => {
        await authController.login(req, res, next)
    }        
);

router.post('/logout', async (req, res, next) => {
    await authController.logout(req, res, next);
})

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

//endpoint do ponownego wysłania linku aktywacyjnego
//formularz przyjmuje adres email
router.post('/reactivate', async (req, res, next) => {
    await authController.reactivate(req, res, next);
})

// endpoint do tworzenia nowego accessTokenu za pomocą refreshtokenu
// w body musi być przesłany refreshToken
router.post('/token', async (req, res, next) => {
    await authController.refreshToken(req, res, next);
})

// endpoint do zmiany hasła przez usera
// w body musi zostać przesłane nowe hasło
// tylko jako jedno pole zostaje przesłane, bo porównanie czy potwierdzenie 
// hasła się zgadza z tym wpisanym to rola frontendu
router.post('/password/change', jwtMiddleware.authenticateToken,
    async (req, res, next) => {
        await authController.changePassword(req, res, next);
})


module.exports = router;
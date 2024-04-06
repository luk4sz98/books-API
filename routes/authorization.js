const { Router } = require('express');
const AuthController = require('../controllers/authorizathionController');
const accountStatusMiddleware = require('../middleware/accountCheckerMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');

const router = Router();
const authController = new AuthController()

// logowanie - autoryzacja, po udanym loginie zostanie zwrócony
// tokenJwt i refreshToken - to gdzie będzie przechowywany jwtToken decyduje frontend
// refreshToken jest przechowywany w bazie do momentu wylogowania
// BY MÓC SIĘ ZALOGOWAĆ KONTO MUSI BYĆ AKTYWNE
router.post('/login', 
    accountStatusMiddleware.checkStatus, 
    async (req, res, next) => {
        await authController.login(req, res, next)
    }        
);

// kasuje refresh token z bazy dla danego user
// co automatycznie powoduje że user straci dostep do autoryzowanych treści
router.post('/logout', async (req, res, next) => {
    await authController.logout(req, res, next);
})

// zakłada nowe konto użytkownika dla danych przesłanych w body
// na podany adres email zostaje przesłany link aktywacyjny do konta
// z racji, że utworzone konto jest domyślnie nieaktywne
router.post('/register', async (req, res, next) => {
    await authController.registration(req, res, next);
})

// endpoint rozpoczynający akcje przypomnienia/zresetowania hasła
// zostanie przesłany na podany adres email link do resetu hasła
// jeśli istnieje konto z podanym adresem email
router.post('/password/reset', async (req, res, next) => {
    await authController.resetPassword(req, res, next);
})

// ednpoint kończący proces resetowania/przypomnienia hasła
// należy w headerze autoryzacyjnym przesłać token do resetu hasła, 
// który to jest zwracany w poprzednim endpoincie
//
// !!! WAŻNE BEZ FRONTENDU NALEŻY UŻYĆ ENDPOINTU POST UDERZAJĄĆ NP W PORGRAMOWNIE POSTMAN
// Z RACJI, ŻE FRONTEND BYŁBY ODPOWIEDZIALNY ZA PRZECHWYCENIE PO KLIKNIĘCIU W LINK PRZESŁANY NA MAILA
// I WYŚWIETLENIE ODPOWIEDNIEGO FORMULARZU, KTÓRY NASTEPNIE UDERZAŁBY WŁASNIE NA ENDPOINT POST
router.get('/password/reset/change', (req, res, next) => {
    res.status(200).send({ message: 'Brak frontendu, proszę użyć tego samego endpointu ale w wersji POST'})
})
router.post('/password/reset/change', jwtMiddleware.checkPwdResetToken,
    async (req, res, next) => {
        await authController.setNewPassword(req, res, next)
})

// endpoint służący do aktywacji konta. zostanie wywołany po 
// naciśnięciu na przesłany link w mailu
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